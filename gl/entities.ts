import Gl = require("Gl");

import View = require('../View');
import UniformEntity = require("./UniformEntity")
import GlEntity = require('./GlEntity')

import GlCore = require("./core")
import ShaderSpecification = GlCore.ShaderSpecification;
import Hashtable = GlCore.Hashtable;

class TupleListEntity <T, U, V, TT> extends GlEntity<T,U,V> {
    constructor(public data : TT[], 
		public tupleSize : number, 
		shaderSpec : ShaderSpecification<T,V,U>, 
		public glMode : string, 
		u : U) {
        super(shaderSpec, u);        
    }    

    getBufferData(n : string) : [Float32Array, number] {
        if(this.data.length == 0)
	    return [new Float32Array(0), 1];
	
	var data = <any>this.data;
        var elemSize = data[0][0][n].length;
        if(elemSize === undefined) 
	    elemSize = 1;
        
	var currIdx = 0;

        var rtn = new Float32Array(this.data.length * elemSize * this.tupleSize);        
        for(var i = 0;i < this.data.length;i++){
	    for(var idx = 0;idx < this.tupleSize;idx++)
		for(var j = 0;j < elemSize;j++)
		    rtn[currIdx++] = elemSize == 1 ? data[i][idx][n] : data[i][idx][n][j];
        }
	console.log(this,rtn);
        return [rtn, elemSize];
    }

    draw(gl : WebGLRenderingContext) {
	var mode = (<any>gl)[this.glMode];
        gl.drawArrays(mode, 0, this.data.length * this.tupleSize);
    }    

}

class ListEntity <T, U, V> extends GlEntity<T,U,V> {    
    constructor(public data : T[], 
		shaderSpec : ShaderSpecification<T,V,U>, 
		public glMode : string,
		u : U) {
        super(shaderSpec, u);        
    }    
    getBufferData(n : string) : [Float32Array, number] {
        if(this.data.length == 0)
	    return [new Float32Array(0), 1];

	var data = <any> this.data;
        var elemSize = data[0][n].length;
        if(elemSize === undefined) 
	    elemSize = 1;
        
	var currIdx = 0; 
        var rtn = new Float32Array(data.length * elemSize);        
        for(var i = 0;i < data.length;i++){
	    for(var j = 0;j < elemSize;j++)
                rtn[currIdx++] = elemSize == 1 ? data[i][n] : data[i][n][j];
        }
        return [rtn, elemSize];
    }
    draw(gl : WebGLRenderingContext) {
	var mode = (<any>gl)[this.glMode];
        gl.drawArrays(mode, 0, this.data.length);
    }    
}


export class TrianglesEntity <T,U,V> extends TupleListEntity<T, U, V, [T, T, T]> {
    constructor(public data : [T,T,T] [], 
		shaderSpec : ShaderSpecification<T,V,U>, 
		u : U = null) {
        super(data, 3, shaderSpec, "TRIANGLES", u);        
    }
}

export class TriangleStripEntity <T,U,V> extends ListEntity<T,U,V> {    
    constructor(public data : T[], shaderSpec : ShaderSpecification<T,V,U>, u : U) {
        super(data, shaderSpec, "TRIANGLE_STRIP", u);        
	if(data.length < 3) {
	    throw new Error("TriangleStrip requires 3 + n number of data points."); 
	}
    }
}

export class TriangleFanEntity <T,U,V> extends ListEntity<T,U,V> {    
    constructor(public data : T[], shaderSpec : ShaderSpecification<T,V,U>, u : U) {
        super(data, shaderSpec, "TRIANGLE_FAN", u);        
	if(data.length < 3) {
	    throw new Error("TriangleFan requires 3 + n number of data points."); 
	}
    }
}

export class LinesEntity <T,U,V> extends TupleListEntity<T,U,V, [T,T]> {
    constructor(public data : [T,T] [], shaderSpec : ShaderSpecification<T,V,U>, u : U = null) {
        super(data, 2, shaderSpec, "LINES", u);        
    }
};

class LineLoopEntity <T,U,V> extends ListEntity<T,U,V> {
    constructor(public data : T[], shaderSpec : ShaderSpecification<T,V,U>, u : U = null) {
        super(data, shaderSpec, "LINE_LOOP", u);        
    }
}

class LineStripEntity <T,U,V> extends ListEntity<T,U,V> {    
    constructor(public data : T[], shaderSpec  : ShaderSpecification<T,V,U>, u : U = null) {
        super(data, shaderSpec, "LINE_STRIP", u);        
	if(data.length < 2) {
	    throw new Error("LineStrips require 2 + n number of data points."); 
	}
    }
}

class PointsEntity <T,U,V> extends ListEntity<T,U,V> {
    constructor(public data : T[], shaderSpec : ShaderSpecification<T,V,U>, u : U = null) {
	super(data, shaderSpec, "POINTS", u);        
    }
}

