import IViewEntityNS = require('../ViewEntity');
import IEntity = IViewEntityNS.IEntity;

import View = require('../View');
import Core = require('./Core');


class UniformEntity<U> extends IViewEntityNS.ObjectUniformsProvider  {
    prerenderCallbacks : IViewEntityNS.RenderCallback[];
    constructor(uniforms : U = null ) {           
	super(uniforms);
	this.prerenderCallbacks = [];
    }

    render(gl : WebGLRenderingContext) { throw new Error("Virtual class"); }
}

export = UniformEntity; 
