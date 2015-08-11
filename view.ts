declare var require : any;
var $ = require("jquery")

import GlCore = require("./Gl/core");
import UniformEntity = require("./Gl/UniformEntity");
import IViewEntityNS = require("./ViewEntity");
import IViewEntity = IViewEntityNS.IViewEntity;
import ViewGroup = require("./ViewGroup");
type GlValue = GlCore.GlValue;

class ViewUniformsProvider extends ViewGroup {
    mouse_xy : [number,number];
    start_time : number;
    time : number; 
    constructor (public div: HTMLDivElement) {
	super();
	this.mouse_xy = [0,0]; 
	this.start_time = Date.now(); 
	this.div.addEventListener('mousemove', 
				  e => this.mouse_xy = [e.clientX / this.div.offsetWidth, e.clientY / this.div.offsetHeight]);
    }
    getValue(k:string) : GlValue {
	//var pre = "glycerine_";
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
	    return this.div.offsetWidth / this.div.offsetHeight; 
	}
	return null; 
    }
    getProvidedValues() {
	return ["mouse_xy", "time_s", "time_ms"];
    }
};

class View extends ViewUniformsProvider  { 
    gl    : WebGLRenderingContext; 
    ctx2d : CanvasRenderingContext2D;  
    entities: IViewEntity[] = [];
    canvas3d: HTMLCanvasElement;
    canvas2d: HTMLCanvasElement;
    
    constructor(public div: HTMLDivElement, options : any = {}) {	
	super(div);
	this.canvas3d = document.createElement('canvas');
	this.canvas2d = document.createElement('canvas');

        this.div.appendChild(this.canvas3d); 
        this.div.appendChild(this.canvas2d); 

        var gl = this.gl = <WebGLRenderingContext> this.canvas3d.getContext('webgl');

	var ctx2d = this.ctx2d =  <CanvasRenderingContext2D> this.canvas2d.getContext('2d');

	if( $(this.div).css("position") != "absolute" ) 
            $(this.div).css("position","relative");

	$(this.canvas2d).css("position", "absolute");
	$(this.canvas3d).css("position", "absolute");

        this.canvas2d.width = this.canvas3d.width = $(this.div).width();
        this.canvas2d.height = this.canvas3d.height = $(this.div).height();

        options = options || {}; 

	options.clearColor = options.clearColor || [1, 1, 1, 1]; 
	console.log(options)
	gl.clearColor.apply(gl, options.clearColor); 
        gl.viewport(0, 0, this.canvas3d.width, this.canvas3d.height);

        gl.enable(gl.DEPTH_TEST);                               // Enable depth testing
        gl.depthFunc(gl.LEQUAL);                                // Near things obscure far things
        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);      // Clear the color as well as the depth buffer.

        gl.lineWidth(1);
    }    
    
    getView() {
	return this;
    }

    startRenderLoop() {
	var self = this;
	function render() {
	    var gl = self.gl; 
	    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);      // Clear the color as well as the depth buffer.
	    self.ctx2d.save();
	    self.ctx2d.setTransform(1,0,0,1,0,0);
	    self.ctx2d.clearRect(0,
				 0,
				 self.canvas2d.width,
				 self.canvas2d.height);
	    self.ctx2d.restore();
	    self.time = +(Date.now() - self.start_time);	    
	    self.render();
	    requestAnimationFrame(render);
	};
	render();
    }
};

export = View;
