import View = require('view')
import GlCore = require('./Gl/core')

export interface RenderCallback {
    (): void;
}

export interface IViewEntity {
    parent : IViewEntity;
    getView() : View; 
    prerenderCallbacks : RenderCallback[];    
    render (): void ;

    getValue(k:string) : GlCore.GlValue;
    getProvidedValues() : string[]; 
}

export class ViewEntityBase implements IViewEntity {
    view : View = null;
    prerenderCallbacks : RenderCallback[] = [];
    constructor(public parent : IViewEntity = null) {}
    getView() {
	if(this.view === null)
	    this.view = this.parent.getView(); 
	return this.view;
    }
    render () {
	this.prerenderCallbacks.forEach(cb => cb()); 
    };
    getValue(k:string)  { return this.parent.getValue(k); }
    getProvidedValues() { return this.parent.getProvidedValues(); }
}


