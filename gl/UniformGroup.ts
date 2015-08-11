import UniformEntity = require ("./UniformEntity"); 
import View = require('../View');
import ViewGroup = require('../ViewGroup');

class UniformGroup<U> extends UniformEntity<U> {
    constructor(public children : UniformEntity<U>[] = [], public uniforms : U = null) {               
	super(uniforms);
	this.children.forEach(c => c.uniformLookup.lst.push(this.uniformLookup)); 
    }   
    render(view : View) { 
	this.children.forEach(e => e.render(view));
    }
    
    preRender() {}
    postRender() {}
}

export = UniformGroup;
