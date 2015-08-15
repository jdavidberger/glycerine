declare var require : any;
var $ = require("jquery")

//import GlCore = require("./Gl/core");
//import UniformEntity = require("./Gl/UniformEntity");
import IViewEntityNS = require("./ViewEntity");
import LayerModule = require("./Layer");
import ILayer = LayerModule.ILayer;
//import IViewEntity = IViewEntityNS.IViewEntity;
import ViewGroup = IViewEntityNS.ViewGroup;

class ViewUniformsProvider extends IViewEntityNS.ObjectUniformsProvider {
    mouse_xy : [number,number];
    start_time : number;
    time : number; 
    constructor (public div: HTMLDivElement, obj : any = {}) {
	super(obj);
	this.mouse_xy = [0,0]; 
	this.start_time = Date.now(); 
	this.div.addEventListener('mousemove', 
				  e => this.mouse_xy = [e.clientX / this.div.clientWidth, e.clientY / this.div.clientHeight]);
	this.div.style.position = "relative";
    }
    getValue(k:string) : any {
	var pre = "";
	switch(k) {
	case pre + "mouse_xy": 
	    return this.mouse_xy;
	    break;
	case pre + "time_s":
	    return this.time / 1000.0; 
	case pre + "time_ms":
	    return this.time; 
	case pre + "aspect_ratio":
	    return this.div.clientWidth / this.div.clientHeight; 
	}
	return super.getValue(k); 
    }
    getProvidedValues() {
	return ["mouse_xy", "time_s", "time_ms"];
    }
};

class View extends ViewUniformsProvider  { 
    start_time : number; 
    constructor( div: HTMLDivElement, obj : any = {}, public children : ILayer[] = []) {	
	super(div, obj);
	this.start_time = +Date.now(); 
	this.children.forEach(c => this.add(c));
    }    

    add(layer : ILayer) {	
	layer.parent = this; 
	this.div.appendChild(layer.element);
	$(this.div).css("user-select", "none");

	if(layer.element instanceof HTMLCanvasElement) {
	    var canvas : HTMLCanvasElement = < HTMLCanvasElement> layer.element; 
	    canvas.width = this.div.clientWidth;
	    canvas.height = this.div.clientHeight;
	}
	$(layer.element).resize();
	this.children.push(layer);
    }
    render() {
	super.render(null); 
	this.time = Date.now() - this.start_time;
        this.children.forEach(e => e.render());
    }
    clientToWorld([x,y] : [number,number])  {
	var viewModel = this.getValue("viewModel");
	return viewModel.transformTo([x,y], {top:0,left:0,right:this.div.clientWidth,bottom:this.div.clientHeight});
    }
    startRenderLoop() {
	var self = this;
	function render() {
	    self.render();
	    requestAnimationFrame(render);
	};
	render();
    }
};

export = View;
