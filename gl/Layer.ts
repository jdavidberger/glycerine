/// <reference path='../Canvas/Layer.ts'/>

declare var require : any;
var $ = require("jquery")

import CoreLayer = require('../Layer');
import Canvas = require('../Canvas/Layer');
import View = require('../View');
import ViewEntities = require("../ViewEntity"); 
import IEntity = ViewEntities.IEntity; 

export class Layer extends Canvas.CanvasBasedLayer< WebGLRenderingContext > {       
    constructor(obj : any = {}, children : IEntity[] = [], zIndex : number = 0) {
	super(children, "webgl", zIndex, obj); 
	var gl = this.ctx; 

	// Sensible defaults. User can customize by just making the appropriate calls on this.ctx
	gl.clearColor(0, 0, 0, 0); 
        gl.viewport(0, 0, this.element.width, this.element.height);
        gl.enable(gl.DEPTH_TEST);                               // Enable depth testing
        gl.depthFunc(gl.LEQUAL);                                // Near things obscure far things
        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);      // Clear the color as well as the depth buffer.

        gl.lineWidth(1);

	$(this.element).resize(function() {
	    gl.viewport(0, 0, this.element.width, this.element.height);
	}.bind(this));
    }

    clear() {
	this.ctx.clear(this.ctx.COLOR_BUFFER_BIT|this.ctx.DEPTH_BUFFER_BIT);
    }

}
