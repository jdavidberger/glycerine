/// <reference path="../typings/es6-collections/es6-collections.d.ts"/>

import IViewEntityNS = require('../ViewEntity');
import IViewEntity   = IViewEntityNS.IViewEntity;
import View = require('../View');
import UniformEntity = require("./UniformEntity")

import GlCore = require("./core")
import ShaderSpecification = GlCore.ShaderSpecification;
import Hashtable = GlCore.Hashtable;

function getImageData(value : GlCore.GlTextureTypes) : ImageData {
    if(value instanceof Image)
	return <ImageData> <any>value; 
    return <any>new Uint8Array([255, 0, 0, 128]);
}

class TextureMapping {
    textureTypesToIds    : WeakMap<GlCore.GlTextureTypes, number>;
    glEntityUniformToIds : WeakMap<IViewEntity, Hashtable<[number, WebGLTexture]> >;
    nextId : number;
    constructor(public gl : WebGLRenderingContext) {
	this.textureTypesToIds = new WeakMap<GlCore.GlTextureTypes, number>();
	this.glEntityUniformToIds = new WeakMap<IViewEntity, Hashtable<[number, WebGLTexture]> >();
	this.nextId = 0; 
    }
    getEntityHash(entity: IViewEntity) {
	var nameToIdxHash = this.glEntityUniformToIds.get(entity); 
	if(nameToIdxHash === undefined) {
	    nameToIdxHash = {};
	    this.glEntityUniformToIds.set(entity, nameToIdxHash);
	}
	return nameToIdxHash; 
    }
    getNextId() : number {
	return this.nextId++; 
    }
    getOrMap(entity : IViewEntity, name : string, v : GlCore.GlTextureTypes) {
	var textureIdx = this.textureTypesToIds.get(v); 

	// This means that a new value was filled in for the texture. We could still have a space allocated, but we will have to rebind the texture. 
	if(textureIdx === undefined) {	    
	    var texture : WebGLTexture;
	    var tuple = this.getEntityHash(entity)[name]; 
	    
	    [textureIdx, texture] = tuple === undefined ? 
		[undefined, undefined] : tuple; 

	    if(textureIdx === undefined) 
		textureIdx = this.getNextId(); 

	    var gl = this.gl;
	    gl.activeTexture(gl.TEXTURE0 + textureIdx);
	    
	    // No texture yet? We create one and add its position. 
	    if(texture === undefined) {
		if(v instanceof WebGLTexture) {
		    texture = v; 
		} else {
		    texture = gl.createTexture();
		    gl.bindTexture(gl.TEXTURE_2D, texture);
		    
		    function setupParams() {
			// Set the parameters so we can render any size image.
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		    }

		    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
				  new Uint8Array([0, 0, 0, 0]) );

		    if(v instanceof Image) {
			v.onload = function() {
			    gl.activeTexture(gl.TEXTURE0 + textureIdx);
			    gl.bindTexture(gl.TEXTURE_2D, texture);
			    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, <any>v);		
			}
			if(v.complete)
			    v.onload(undefined);
			setupParams();
		    } else if(v instanceof HTMLVideoElement) {
			entity.prerenderCallbacks.push( function() {
			    if(v.currentTime > 0) {
				gl.activeTexture(gl.TEXTURE0 + textureIdx);
				gl.bindTexture(gl.TEXTURE_2D, texture);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, <any>v);		
			    }
			});
			setupParams();
		    }else {
			// Upload the image into the texture.
			var imageData = getImageData(v);		    
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageData);		
			setupParams();
		    }
		}
		this.getEntityHash(entity)[name] = [textureIdx, texture]; 
		this.textureTypesToIds.set(v, textureIdx); 
		console.log(textureIdx, name);
	    } else {
		// Make sure to rebind to the TEXUTREidx
		gl.bindTexture(gl.TEXTURE_2D, texture);
	    }	 
	}	
	return textureIdx; 
    }
};

var textureMappings = new WeakMap<WebGLRenderingContext, TextureMapping>();
function getTextureMapping( gl : WebGLRenderingContext ) {
    var rtn = textureMappings.get(gl);
    if(rtn === undefined) {
	rtn = new TextureMapping(gl); 
	textureMappings.set(gl, rtn);
    }
    return rtn;
}



class GlEntity<T,U,V> extends UniformEntity<U> {
    buffers : Hashtable<[WebGLBuffer,number]>; 

    constructor(public shaderSpec : ShaderSpecification<T,V,U>, uniforms : U = null ) {                
	super(uniforms); 
        this.buffers = {}; 

    }
    getTextureIndex(gl :  WebGLRenderingContext, name : string, v : GlCore.GlTextureTypes) : number {
	var mapping = getTextureMapping(gl); 	
	return mapping.getOrMap(this, name, v); 
    }
    getUniformSetFunction(gl : WebGLRenderingContext, info : WebGLActiveInfo) {
	function getFnSuffix(t : number) {
	    switch(t) {
	    case gl.FLOAT:       return "1f";
	    case gl.FLOAT_VEC2:  return "2f";
	    case gl.FLOAT_VEC3:  return "3f";
	    case gl.FLOAT_VEC4:  return "4f";
	    case gl.FLOAT_MAT2:  return "Matrix2fv";
	    case gl.FLOAT_MAT3:  return "Matrix3fv";
	    case gl.FLOAT_MAT4:  return "Matrix4fv";
	    case gl.SAMPLER_2D:
	    case gl.SAMPLER_CUBE:
	    case gl.INT:         return "1i";
	    case gl.INT_VEC2:    return "2i";
	    case gl.INT_VEC3:    return "3i";
	    case gl.INT_VEC4:    return "4i";
	    }
	    throw new Error("Unrecognized uniform type: " + t); 
	};

	var isArray = info.size > 1; 
	var suffix = getFnSuffix(info.type);
	var name = "uniform" + suffix + (isArray ? "v" : ""); 	
	var isMat = suffix[0] == 'M'; 
	var isTexture = info.type == gl.SAMPLER_2D || info.type == gl.SAMPLER_CUBE; 
	var self = this;
	if(isTexture) {
	    return function(gl : WebGLRenderingContext, l:number, v : GlCore.GlValue ) { 		
		gl.uniform1i(l, self.getTextureIndex(gl, info.name, <GlCore.GlTextureTypes>v));
	    }
	}

	if(isMat)
	    return function(gl : WebGLRenderingContext, l:number, v:number[]) { 
		var fn = <(location: WebGLUniformLocation, f:number, v: number[]) => void> (<any>gl)[name]; 
		fn.call(gl, l, 0, v); 
	    }
	if(isArray)
	    return function(gl : WebGLRenderingContext, l:number, v:[number]) { 
		var fn = <(location: WebGLUniformLocation, v: number[]) => void> (<any>gl)[name]; 
		fn.call(gl, l, v); 
	    }
	return function(gl : WebGLRenderingContext,  l:number, v:[number]) { 
	    var fn = <(location: WebGLUniformLocation, v: number[]) => void> (<any>gl)[name]; 
	    fn.apply(gl, [l].concat(v) ); 
	}
	
    }

    setUniform(gl : WebGLRenderingContext, program : WebGLProgram, info : WebGLActiveInfo) {
	var location = gl.getUniformLocation(program, info.name);
	var v = this.getValue(info.name); 
	if(v == null) {
	    throw new Error("Could not find uniform for name " + info.name + ". Available uniform names are : " + 
			    this.getProvidedValues().join(", ")); 
	}
	var isArray = info.size > 1; 
	var name = "uniform";
	
	var fn : any = this.getUniformSetFunction(gl, info);
	fn(gl, location, v);
    }
    
    draw(gl : WebGLRenderingContext) {}
    render() {
	this.prerenderCallbacks.forEach(cb => cb()); 
        var gl = this.getView().gl;
        var program = this.getProgram(gl);
        gl.useProgram(program);        

        var numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);        
        for (var i = 0; i < numAttribs; ++i) {
	    var info = gl.getActiveAttrib(program, i);
	    var buffer = this.getBuffer(gl, info.name); 
	    gl.bindBuffer(gl.ARRAY_BUFFER, buffer[0]); 

	    var location = gl.getAttribLocation(program, info.name);
	    gl.enableVertexAttribArray(location);
	    gl.vertexAttribPointer(location, buffer[1], gl.FLOAT, false, 0, 0);
        }

	var numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);        
	for (var i = 0;i < numUniforms;i++) {
	    var info = gl.getActiveUniform(program, i); 
	    this.setUniform(gl, program, info); 
	}

	this.draw(gl);
    }    

    getProgram(gl : WebGLRenderingContext) {
        return this.shaderSpec.GetProgram(gl); 
    }
    getBufferData(n : string) : [Float32Array, number] {
        return [new Float32Array(0), 1];
    }
    getBuffer(gl : WebGLRenderingContext, n : string) : [WebGLBuffer, number] {
        if(this.buffers[n])
	    return this.buffers[n];
        this.buffers[n] = [gl.createBuffer(), 0];
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[n][0]);        
	var bufferData = this.getBufferData(n); 
        gl.bufferData(gl.ARRAY_BUFFER, bufferData[0], gl.STATIC_DRAW);
	this.buffers[n][1] = bufferData[1];
        return this.buffers[n];
    }
}

export = GlEntity
