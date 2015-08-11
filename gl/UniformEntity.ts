import IViewEntityNS = require('../ViewEntity');
import IViewEntity = IViewEntityNS.IViewEntity;

import View = require('../View');
import Core = require('./Core');


class ObjectUniformsProvider extends IViewEntityNS.ViewEntityBase {
    constructor(public uniformObject : any, parent : IViewEntity = null) {
	super(parent);
    }
    getValue(k:string) : Core.GlValue {
	if(this.uniformObject && this.uniformObject[k] !== undefined) {
	    var v = this.uniformObject[k];
	    if(v instanceof Function){
		return v.call(this.uniformObject, this); 
	    }
	    return v;
	}
	return this.parent && this.parent.getValue(k);
    }
    getProvidedValues() {
	return this.uniformObject ? Object.keys(this.uniformObject) : [];
    }
}

class UniformEntity<U> extends ObjectUniformsProvider  {
    prerenderCallbacks : IViewEntityNS.RenderCallback[];
    constructor(uniforms : U = null ) {           
	super(uniforms);
	this.prerenderCallbacks = [];
    }
    render() { throw new Error("Virtual class"); }
}

export = UniformEntity; 
