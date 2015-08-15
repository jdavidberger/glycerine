import View = require("./view");
import ViewEntities = require("./ViewEntity"); 
import IEntity = ViewEntities.IEntity; 

export import ILayer = ViewEntities.ILayer;

export class Layer < T, Element extends HTMLElement > extends ViewEntities.ViewGroup implements ViewEntities.ILayer {
    ctx : T = null;
    element : Element;
    constructor(elementBase : string,
		children : IEntity[], 
		public zIndex : number = 0,
		obj : any = {}) {
	super(children, obj);
	var element = document.createElement(elementBase);
	if(element instanceof Element)
	    this.element = <Element> element;
	else
	    throw new Error("Invalid element creation, tried to create " + Element.toString() + ", but got " + element.toString()); 

	this.element.style.zIndex = "" + zIndex;
	this.element.style.position = "absolute";
	this.element.style.top = 
	    this.element.style.bottom = 
	    this.element.style.left = 
	    this.element.style.right = "0px";
    }
    getLayer() { return this; }
    clear() : void {}
    render() {
	this.clear(); 
	super.render(this.ctx);
    }
}; 
