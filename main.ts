/// <reference path='./node_modules/js2glsl/js2glsl.d.ts'/>

import Glycerine = require('./Glycerine');  
import js2glsl = require("js2glsl") 

declare var require : any;
var mat4 = require('gl-matrix').mat4;

var view = new Glycerine.View( document.getElementsByTagName("div")[0] );

interface Point3 {
    pt : [number, number, number];
}

class MyShader1 extends js2glsl.ShaderSpecification <Point3, Point3, {t:number}> {
    fmod(a:number,b:number) { return a - (Math.floor(a / b) * b); }    
    VertexPosition() {
	this.varyings.pt = this.attributes.pt;
	var rx = Math.cos(this.uniforms.t); 
	var max_rx = 1; 
	var v  = Math.abs(Math.cos(this.uniforms.t*2)); 
	this.varyings.pt[2] = v;
	var miscale = 1.0 / Math.sqrt(2);
	var mascale = 1.0 / Math.sqrt(2);
	var scale = miscale + (mascale - miscale) * v / max_rx; 
	var x = this.attributes.pt[0] * scale;
	var y = this.attributes.pt[1] * scale;
	return [Math.cos(this.uniforms.t) * x + Math.sin(this.uniforms.t) * y,
		Math.sin(this.uniforms.t) * x - Math.cos(this.uniforms.t) * y ];
    }
    FragmentColor() {
	return [0,0];
    }
};

class MyShader2 extends MyShader1 {
    FragmentColor() {
	return [this.varyings.pt[2],
		this.varyings.pt[2]];
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
var sharedUniform = {t:t};
view.add( new Glycerine.TrianglesEntity( dataSeries3, new MyShader2, sharedUniform ) );
view.add( new Glycerine.LinesEntity( outline, new MyShader1(), sharedUniform ) );

function render() {
    sharedUniform.t += 0.01; 
    view.render();
    requestAnimationFrame(render);
};
render();

