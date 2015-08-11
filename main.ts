/// <reference path='./node_modules/js2glsl/js2glsl.d.ts'/>

import Glycerine = require('./Glycerine');  
import js2glsl = require("js2glsl") 

declare var require : any;
var mat4 = require('gl-matrix').mat4;

var view = new Glycerine.View( document.getElementsByTagName("div")[0] );

interface Point3 {
    pt : [number, number, number];
}

class MyShader1 extends js2glsl.ShaderSpecification <Point3, any, any> {
    fmod(a:number,b:number) { 
	return a - (Math.floor(a / b) * b); 
    }    
    VertexPosition(builtIns : any) {
	this.varyings.pt[0] = (this.attributes.pt[0] / 2) + .5;
	this.varyings.pt[1] = (this.attributes.pt[1] / 2) + .5;
	var rx = Math.cos(this.uniforms.time_s); 
	var max_rx = 1; 
	var v  = Math.abs(Math.cos(this.uniforms.time_s*2)); 
	var scale = 1.0;// / Math.sqrt(2);
	
	var x = this.attributes.pt[0] * scale;
	var y = this.attributes.pt[1] * scale;

	this.varyings.xy = [ this.uniforms.mouse_xy[0]*2 - 1 + Math.cos(this.uniforms.time_s / 100.0) * x + Math.sin(this.uniforms.time_s / 100.0) * y,
			    -this.uniforms.mouse_xy[1]*2 + 1 + Math.sin(this.uniforms.time_s / 100.0) * x - Math.cos(this.uniforms.time_s / 100.0) * y ];
	return this.varyings.xy;
    }
    FragmentColor(builtIns : any) {
	return builtIns.texture2D(this.uniforms.image, this.varyings.pt); 
    }
};

class MyShader2 extends MyShader1 {
    FragmentColor(builtIns : any ) {
	if(this.fmod(this.varyings.pt[0] + this.uniforms.time_s/10, 0.1) > 0.05 != 
	   this.fmod(this.varyings.pt[1] + this.uniforms.time_s/10, 0.1) > 0.05)
	    return builtIns.texture2D(this.uniforms.video, this.varyings.pt);
	return builtIns.texture2D(this.uniforms.image, this.varyings.pt);
    }
};

var dataSeries3 : [Point3,Point3,Point3][] = [
    [ {pt: [ 1, -1,1] }, 
      {pt: [ -1,-1,.0] }, 
      {pt: [ 1,  1,.5] } ],
    [ {pt: [ 1, 1,.5] }, 
      {pt: [ -1,  -1,.0] }, 
      {pt: [ -1,  1,1] } ]
] 

var outline = dataSeries3.reduce(function(acc, v) {
    return acc.concat([ [ v[0], v[1] ], 
			[ v[1], v[2] ], 
			[ v[2], v[0] ] ]); 
},[]); 

var t = 0; 

var video = document.createElement('video');
video.src = "small.ogv";
//video.src = "current_eit_284.mp4";
video.autoplay = true; 
video.loop = true; 
video.muted = true;
var nonSharedUniform = {
    t:t,
    video: video,
    image: new Image(64, 64)
};
nonSharedUniform.image.src = 'texture.jpg';

view.add( new Glycerine.ViewGroup([
    new Glycerine.Gl.TrianglesEntity( dataSeries3, new MyShader2),
    new Glycerine.Gl.LinesEntity( outline, new MyShader1 )
], nonSharedUniform ));

function render() {
    view.render();
    requestAnimationFrame(render);
};
render();

