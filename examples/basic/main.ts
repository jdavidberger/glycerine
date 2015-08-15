/// <reference path='../../node_modules/js2glsl/js2glsl.d.ts'/>
import Glycerine = require('../../Glycerine');  
import GlycerineCanvas = require('../../Canvas/Canvas');  
import js2glsl = require("js2glsl") 
import data = require('./data');

var model : { time: number, heartrate: number, label?: string }[] =
    data.map( function(d, idx) { return { time: idx * 0.5, heartrate: d}; } );

model[800].label = "Middle";
model[1799].label = "End";

// This is the view model we want to display that data with. 
//var viewModel = new Glycerine.ViewModels.ViewModel2D({left:-10, right:40, top: 60, bottom:-10});
var viewModel = new Glycerine.ViewModels.ViewModel2D({left:-50, right:1803*0.5, top: 120, bottom:-50});

// This is the view we will put it into.
var viewDiv = document.getElementsByTagName("div")[0];
var view = new Glycerine.View( viewDiv, {viewModel:viewModel} );

// We'll organize it into a few layers; mainly to demonstrate the layers. This example
// could probably be done all in canvas.

// Canvas Layer --------------------------------------------------------
var canvasLayer = new Glycerine.Canvas.Layer(viewModel);

// We define a canvas entity that draws origin. 
class DrawOrigin extends GlycerineCanvas.Entity {
    render(ctx : CanvasRenderingContext2D) {
	super.render(ctx);
	
	// This grabs the drawing boundary based on the current view model. 
	var bounds = this.getLayer().getDrawingBounds(); 
	var m = viewModel.get3x3({top:0,left:0,right:viewDiv.clientWidth,bottom:viewDiv.clientHeight});
	var [lx, ly] = [Math.abs(m[0] * 0.25), 
			Math.abs(m[4] * 0.25)];

	ctx.strokeStyle = "red";

	ctx.lineWidth = lx;
	ctx.beginPath();
	ctx.moveTo(bounds.left,  0);
	ctx.lineTo(bounds.right, 0);
	ctx.stroke();
	ctx.closePath();

	ctx.lineWidth = ly;
	ctx.beginPath();
	ctx.moveTo(0, bounds.top);
	ctx.lineTo(0, bounds.bottom);
	ctx.stroke();
	ctx.closePath();
    }
}

canvasLayer.add( new DrawOrigin () ); 
view.add(canvasLayer);

// WebGL layer --------------------------------------------------------

// Notice that the GL layer doesn't take a view model quite like canvas and svg did. 
// It takes a uniforms object that is available to the shaders, but its up to the shaders
// to make use of it. 
var glLayer = new Glycerine.GL.Layer({viewModel:viewModel});

// Our custom shader -- just plots time vs temp in accordance with our viewModel. 
// Note that our viewmodel is converted from its ViewModel2D form into a matrix for us. 
class Shader  extends js2glsl.ShaderSpecification <any, any, any> {
    PointSize() {
	return 3;
    }
    VertexPosition(builtIns : any) {
	var time = this.attributes.time;
	var temp = this.attributes.heartrate;
	this.varyings.v = this.attributes.heartrate;
	return builtIns.multMat4(this.uniforms.viewModel, [ time, temp, 0, 1] ); 
    }
    FragmentColor() {
	var v = (this.varyings.v - 80) / 20;
	v = v * v; 
	return [v, 0, (1-v)];
    }
}

// This will draw a line from point to point. 
glLayer.add( new Glycerine.GL.Entities.LineStrip( model, new Shader, {viewModel:viewModel} ) )
// This will draw a point for each plotted point. 
glLayer.add( new Glycerine.GL.Entities.Points( model, new Shader, {viewModel:viewModel} ) )

view.add(glLayer);

// SVG Layer --------------------------------------------------------
var svgLayer = new Glycerine.SVG.Layer(viewModel);

// SVG doesn't have a render function like canvas does -- it simply maintains a DOM.
model.forEach(function(row) {
    // We select out for items that have a label
    if(row.label) {
	var svglabel = <SVGTextElement> document.createElementNS("http://www.w3.org/2000/svg", "text");
	var [x,y] = [row.time, row.heartrate]; 
	svglabel.setAttribute('x', ""+(row.time + 10));
	svglabel.setAttribute('y', ""+row.heartrate); 
	svglabel.setAttribute('writing-mode', 'tb-rl');
	svglabel.setAttribute('text-anchor', 'end');
	svglabel.setAttribute('transform', 'rotate(45, ' + x + ', ' + y + ')');
	svglabel.textContent = row.label; 
	// This adds it to the DOM, under a grouping that is influenced by the view model 
	svgLayer.add(svglabel);

	var svgcircle = <SVGCircleElement> document.createElementNS("http://www.w3.org/2000/svg", "circle");
	svgcircle.setAttribute('cx', ""+row.time);
	svgcircle.setAttribute('cy', ""+row.heartrate);
	svgcircle.setAttribute('r', "2");
	svgLayer.add(svgcircle);
    }   
});

for(var i = 10;i < 120;i+=10) {
    var svglabel = <SVGTextElement> document.createElementNS("http://www.w3.org/2000/svg", "text");
    svglabel.setAttribute('x', ""+(-10));
    svglabel.setAttribute('y', ""+i); 
    svglabel.setAttribute('text-anchor', 'end');
    svglabel.textContent = ""+i; 
    svgLayer.add(svglabel);

    var tickMark = <SVGLineElement> document.createElementNS("http://www.w3.org/2000/svg", "line");
    tickMark.setAttribute("x1", ""+(-7));
    tickMark.setAttribute("x2", ""+(+7));
    tickMark.setAttribute('y1', ""+i); 
    tickMark.setAttribute('y2', ""+i); 
    tickMark.setAttribute('stroke', 'black');
    tickMark.setAttribute('stroke-width', '0.5');
    svgLayer.add(tickMark);
}


for(var i = 100;i < 1000;i+=100) {
    var svglabel = <SVGTextElement> document.createElementNS("http://www.w3.org/2000/svg", "text");
    svglabel.setAttribute('x', ""+i);
    svglabel.setAttribute('y', ""+(-10)); 
    svglabel.setAttribute('text-anchor', 'end');
    svglabel.textContent = ""+(i); 
    svgLayer.add(svglabel);

    var tickMark = <SVGLineElement> document.createElementNS("http://www.w3.org/2000/svg", "line");
    tickMark.setAttribute("y1", ""+(-3));
    tickMark.setAttribute("y2", ""+(+3));
    tickMark.setAttribute('x1', ""+i); 
    tickMark.setAttribute('x2', ""+i); 
    tickMark.setAttribute('stroke', 'black');
    tickMark.setAttribute('stroke-width', '1');
    svgLayer.add(tickMark);
}



view.add(svgLayer); 

// Start the render loop. This just calls the views render in a requestAnimationFrame loop
view.startRenderLoop(); 

var mouseDownAt = null;
var mouseDownBox = null;

viewDiv.addEventListener("mousedown", function(e) {
    mouseDownAt = view.clientToWorld([e.clientX, e.clientY]);
    mouseDownBox = viewModel.box();
});

viewDiv.addEventListener("mouseup", function(e) {
    mouseDownAt = null;
});


viewDiv.addEventListener("mousemove", function(e) {
    if(mouseDownAt === null)
	return;
    var newMouseDownAt = view.clientToWorld([e.clientX, e.clientY]);
    var delta = [mouseDownAt[0] - newMouseDownAt[0],
		 mouseDownAt[1] - newMouseDownAt[1]];
    var box = mouseDownBox; 
    box.left += delta[0];
    box.right += delta[0];
    box.top += delta[1];
    box.bottom += delta[1];
    viewModel.box(box);
    svgLayer.updateView(); 
});
