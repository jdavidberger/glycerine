var Glycerine = require('../../Glycerine');  
var js2glsl = require("js2glsl");
var $ = require('jquery');
var view = new Glycerine.View( document.getElementsByTagName("div")[0], { clearColor: [0,0,0,1]} );

var Group = Glycerine.ViewGroup;

function Texture2DShader() {
    js2glsl.ShaderSpecification.call(this);
}

Texture2DShader.prototype = Object.create(js2glsl.ShaderSpecification.prototype); 
Texture2DShader.prototype.constructor = Texture2DShader; 
Texture2DShader.prototype.VertexPosition = function(builtIns) {
    var xy = this.attributes.xy;
    this.varyings.uv = [xy[0] / 2 + .5,
			xy[1] / 2 + .5];


    xy = builtIns.multVecs2(xy, [this.uniforms.size*this.uniforms.sizeComp,
				 this.uniforms.size*this.uniforms.sizeComp]);
    var c = this.uniforms.center;

    xy = builtIns.addVecs2 (xy, c);

    return builtIns.multMat4(this.uniforms.view, [ xy[0], xy[1], 0, 1 ]);
}

Texture2DShader.prototype.FragmentColor = function(builtIns) {
    var rgba = builtIns.texture2D(this.uniforms.img, this.varyings.uv); 
    if(rgba[3] == 0 || (rgba[0] < 0.01 && rgba[1] < .01 && rgba[2] < .01))
	return;
    return rgba;
}
var shader = new Texture2DShader();

function TextureEntity(u) {
    var box = [ {xy: [  1, -1 ]},
		{xy: [ -1, -1 ]},
		{xy: [  1,  1 ]}, 
		{xy: [ -1,  1 ]},
		{xy: [  1, -1 ]} ];
    Glycerine.Gl.TriangleStripEntity.call(this, box, shader, u);
}
TextureEntity.prototype = Object.create(Glycerine.Gl.TriangleStripEntity.prototype); 
TextureEntity.prototype.constructor = TextureEntity;

function ortho(left, right, bottom, top, near, far) {
    var lr = 1 / (left - right),
        bt = 1 / (bottom - top),
        nf = 1 / (near - far);
    return  [ -2 * lr,       0,    0, 0, 
	            0, -2 * bt,    0, 0,
	            0,       0, 2*nf, 0,
	    (left + right) * lr, (top + bottom) * bt, (far + near) * nf, 1]

};


function squish(d) { 
    if($("#use_log_dist:checked").length)
	d = d > 0 ? Math.log(d+1) : Math.log(-d+1); 
    return d; 
}

var ED = 1 / 10;
var LM = 1; 
var km = 1/17987547.5 * LM; 
var AU = 8.3 * LM;
var EY = 365.25 * ED; 

var viewDistance = squish(40 * AU); 
var aspect = view.getValue("aspect_ratio"); 

function offset_from_parent(d, period, offset) {
    offset = offset || Math.random() * Math.PI * 2;
    return function(values) {
	var c = values.parent.getValue('center'); 
	if(c == undefined)
	    return [0,0]; 

	var t = period == 0 ? 0 : values.getValue('time_s') / period ;	
	var rtn = [ c[0] + Math.cos(t + offset) * squish(d),
		    c[1] + Math.sin(t + offset) * squish(d)];
	return rtn; 
    };
}
function loadImage(src) {
    var img = new Image();
    img.src = src; 
    return img;
}

function TextElement(str) {
    Glycerine.ViewEntity.ViewEntityBase.call(this); 
    this.text = str; 
}

TextElement.prototype = Object.create(Glycerine.ViewEntity.ViewEntityBase.prototype);
TextElement.prototype.constructor = TextElement; 

TextElement.prototype.render = function() {
    var view = this.getView(); 
    var viewMat = this.getValue('view');
    
    var w2 = view.canvas2d.width/2;
    var h2 = view.canvas2d.height/2;

    view.ctx2d.setTransform( 1, 0, 0, 1, w2 * (1 + viewMat[12]),  h2 * (1 - viewMat[13]) ); 
    var pt = this.getValue('center');
    var ppt = this.parent.parent.getValue('center');

    var drawPtAt = [pt[0] * w2 * viewMat[0], 
		    -pt[1] * h2 * viewMat[5] ];

    if(ppt) {
	var pptAt = [ppt[0] * w2 * viewMat[0], 
		    -ppt[1] * h2 * viewMat[5] ];
	var dx = pptAt[0] - drawPtAt[0];
	var dy = pptAt[1] - drawPtAt[1];
	var pxDist = Math.sqrt(dx*dx+dy*dy); 
	if(pxDist < 30)
	    return; 
    }
    view.ctx2d.font = "16px Courier";
    view.ctx2d.textAlign = "center";
    view.ctx2d.textBaseline = "hanging";
    view.ctx2d.fillStyle = "white";
    view.ctx2d.fillText(this.text, 
			drawPtAt[0], drawPtAt[1]);
}

function System(name, info, children) {
    children = children || [];
    info.img = loadImage("images/" + name.toLowerCase() + (info.isPng ? ".png" : ".jpg"));
    if(name.length && info.label != false)
	Group.call(this, [new TextElement(name), new TextureEntity()].concat(children), info); 
    else
	Group.call(this, children, info); 
}

var distance = function(a,b) {
    var dx = a[0] - b[0];
    var dy = a[1] - b[1];
    return Math.sqrt(dx*dx+dy*dy); 
}

System.prototype = Object.create(Group.prototype);
System.prototype.constructor = System;
System.prototype.getInfluenceRadius = function() {
    var infl = squish(this.getValue("size") * 2); 
    var center = this.getValue('center'); 
    this.children.forEach(function(c) {
	if(c instanceof System) {
	    var ccenter = c.getValue('center'); 
	    infl = Math.max( distance(ccenter, center), infl); 
	}
    }); 
    return infl;
}

var solarSystem = {};
solarSystem.Mercury = new System("Mercury",  {size: 4900  * km, center:offset_from_parent(3.2 *LM, 88 * ED)});
solarSystem.Venus = new System("Venus", {size: 12100 * km, center:offset_from_parent(6.0 *LM, 224.7 * ED) });
solarSystem.Luna = new System("Luna", {label: true, size: 3474.8 * km, center:offset_from_parent(384400 * km, 27.32 * ED)});
solarSystem.Earth = new System("Earth", {size: 12800 * km, center: offset_from_parent(8.3167464 * LM, 365.25 * ED) }, [ // Earth System
    solarSystem.Luna
]);
solarSystem.Deimos = new System("Deimos",{size: 8  * km, center:offset_from_parent(23460 * km, 1.2 * ED)}); 
solarSystem.Phobos = new System("Phobos",{size: 28 * km, center:offset_from_parent(9270  * km, 0.319 * ED)});

solarSystem.Mars = new System("Mars", {size: 6800*km, center:offset_from_parent(12.6 *LM, 687 * ED)}, [
    solarSystem.Deimos,
    solarSystem.Phobos
]); 

solarSystem.Callisto = new System("Callisto", {size: 4820 * km, center:offset_from_parent(1883000 * km, 16.689 * ED)}), 
solarSystem.Europa = new System("Europa", {size: 3121  * km, center:offset_from_parent(670900  * km, 3.551 * ED)}), 
solarSystem.Ganymede = new System("Ganymede", {isPng: true, size: 5276  * km, center:offset_from_parent(1070000 * km, 7.155 * ED)}), 
solarSystem.Io = new System("Io", {isPng: true, size: 3629 * km, center:offset_from_parent(421600 * km, 1.769 * ED)}), 

solarSystem.Jupiter = new System("Jupiter", {size: 143000 * km, center:offset_from_parent(43.2*LM, 11.9 * EY)}, [
    solarSystem.Callisto,
    solarSystem.Europa,
    solarSystem.Ganymede,
    solarSystem.Io
]);

solarSystem.Titan = new System("Titan", {isPng:true, size: 5150 * km, center:offset_from_parent(1221870*km, 16 * ED)});
solarSystem.Rhea = new System("Rhea", {isPng:true, size: 1527 * km, center:offset_from_parent(527108*km, 4.5 * ED)});

solarSystem.Saturn = new System("Saturn", {size: 125000 * km, center:offset_from_parent(79.3*LM, 29.7 * EY)}, [
    solarSystem.Titan,
    solarSystem.Rhea
] );
solarSystem.Uranus = new System("Uranus", {size: 51100 * km, center:offset_from_parent(159.6*LM, 84.3 * EY)});
solarSystem.Neptune = new System("Neptune", {size: 49500 * km, center:offset_from_parent(4.1*60*LM, 164.8 * EY)});
solarSystem.Pluto = new System("Pluto", {isPng:true,size: 2300 * km, center:offset_from_parent(39.4 * AU, 248 * EY)} )	;		

solarSystem.Sun = new System("Sun", {view:viewMat, size: 1E6 * km, center:offset_from_parent(1.72e9 * AU, 240e6 * EY), sizeComp:1 },
		     [
			 solarSystem.Mercury,
			 solarSystem.Venus,
			 solarSystem.Earth,
			 solarSystem.Mars,
			 solarSystem.Jupiter,
			 solarSystem.Saturn,
			 solarSystem.Uranus,
			 solarSystem.Neptune,
			 solarSystem.Pluto
		     ])

var tracking = solarSystem.Sun;
var prevTracking = solarSystem.Sun; 
var iterationsHere = 0;

function viewMat(values) {
    var d = 40 *AU;
    var targetC = tracking ? tracking.getValue("center") : [0,0]; 
    var targetViewDistance = tracking ? tracking.getInfluenceRadius() * 1.1 : d; 

    var prevCenter = prevTracking ? prevTracking.getValue("center") : [0,0];
    var prevViewDistance = prevTracking ? prevTracking.getInfluenceRadius() * 1.1 : d ;

    var a = iterationsHere++/5000;
    a = Math.pow(a,.25);
    if(a > 1) a = 1; 
    var b = 1-a;
    var center = [ a * targetC[0] + b * prevCenter[0], a * targetC[1] + b * prevCenter[1]]; 
    var viewDistance = a *targetViewDistance + b * prevViewDistance ;

    return ortho(-viewDistance*aspect + center[0], 
		 viewDistance*aspect + center[0], 
		 viewDistance+ center[1], 
		 -viewDistance+ center[1], -1, 1.);
};

view.add( solarSystem.Sun );

for(var obj in solarSystem) {
    $("<option />", { text: obj }).appendTo($("select")); 
}

$("select").on('change', function() {
    prevTracking = tracking; 
    tracking = solarSystem[ $("select").val() ];
    iterationsHere = 0;
});

view.startRenderLoop(); 
