/// <reference path='../../node_modules/js2glsl/js2glsl.d.ts'/>
import js2glsl = require("js2glsl") 
import Glycerine = require('../../Glycerine');  

interface Point3 {
    pt : [number, number, number];
}

class ShaderBase extends js2glsl.ShaderSpecification <Point3, any, any> {
    fmod(a:number,b:number) { 
	return a - (Math.floor(a / b) * b); 
    }    
    VertexPosition(builtIns : any) {
	// We'll use this for mapping out the texture -- Convert from -1 to 1
	// to 0 1
	this.varyings.pt = [(this.attributes.pt[0] / 2) + .5,
			    (this.attributes.pt[1] / 2) + .5];
	
	// time_s is provided from Glyercine
	var t = this.uniforms.time_s / 10; 
	var [rx, ry] = [Math.cos(t), 
			Math.sin(t) ];

	var [ x,  y] = this.attributes.pt;

	// mouse_xy is also a value given by Glycerine
	var [ox, oy] = [this.uniforms.mouse_xy[0]*2 - 1, -this.uniforms.mouse_xy[1]*2 + 1];

	this.varyings.xy = [ ox + rx * x + ry * y, 
			     oy + ry * x - rx * y];
	return this.varyings.xy;
    }
}

// Extend semantics with JS2GLSL work as you'd expect, we can override 
// ShaderBase's fragmentColor function to pull from the texture.
class MyShader1 extends ShaderBase {
    FragmentColor(builtIns : any) {
	return [0, 0, 0];
    }
};

class MyShader2 extends ShaderBase {
    FragmentColor(builtIns : any ) {
	var boxSize = .5;
	
	// It'll pull in the fmod from ShaderBase
	if(this.fmod(this.varyings.pt[0] + this.uniforms.time_s/10, boxSize) > boxSize/2 != 
	   this.fmod(this.varyings.pt[1] + this.uniforms.time_s/10, boxSize) > boxSize/2)
	    return builtIns.texture2D(this.uniforms.video, this.varyings.pt);
	return builtIns.texture2D(this.uniforms.image, this.varyings.pt);
    }
};

var dataSeries3 : [Point3,Point3,Point3][] = [
    [ {pt: [  1, -1,  1] }, 
      {pt: [ -1, -1, .0] }, 
      {pt: [  1,  1, .5] } ],
    [ {pt: [  1,  1, .5] }, 
      {pt: [ -1, -1, .0] }, 
      {pt: [ -1,  1,  1] } ]
] 

var outline = dataSeries3.reduce(function(acc, v) {
    return acc.concat([ [ v[0], v[1] ], 
			[ v[1], v[2] ], 
			[ v[2], v[0] ] ]); 
},[]); 

// Both normal video and image elements will map to textures. Create them in the normal way.
var video = document.createElement('video');
video.src = "small.ogv";
video.autoplay = true; 
video.loop = true; 
video.muted = true;

var image = new Image(64, 64);
image.src = 'texture.jpg';

// The names here are what maps it to the shader this.uniforms.video/image references. 
var uniforms = {
    video: video,
    image: image;
};


// A view takes in a div and that serves as the viewport
var view = new Glycerine.View( document.getElementsByTagName("div")[0] );

// This will share the uniforms among the whole layer. 
var glLayer = new Glycerine.GL.Layer(uniforms); 

// GL entites take some form of attribute data and a shader implementation. 
// The shader implementation doesn't need to be a JS2GLSL one; it just has 
// to implement an interface that gives a WebGLShaderProgram.

// Triangles takes in a list of triples of whatever struct the shader needs
glLayer.add(new Glycerine.GL.Entities.Triangles( dataSeries3, new MyShader2))

// Lines takes in a list of tuples of the shader struct. 
glLayer.add(new Glycerine.GL.Entities.Lines( outline, new MyShader1 ))

view.add( glLayer ); 

view.startRenderLoop(); 

