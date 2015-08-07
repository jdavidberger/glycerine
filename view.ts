declare var require : any;
var $ = require("jquery")

import IViewEntity = require("ViewEntity");

class View { 
    div: HTMLDivElement;
    canvas: HTMLCanvasElement;
    gl : WebGLRenderingContext; 
    entities: IViewEntity[] = [];
    constructor( div: HTMLDivElement ) {
        this.div = div; 
        var canvas = this.canvas = document.createElement('canvas');
        this.div.appendChild(this.canvas); 
        var gl = this.gl = <WebGLRenderingContext> this.canvas.getContext('webgl');
        $(this.div).css("position","relative");
        this.canvas.width = $(this.div).width();
        this.canvas.height = $(this.div).height();
        
        gl.clearColor(0.9, 0.9, 0.9, 1.0);                      // Set clear color to black, fully opaque
        gl.enable(gl.DEPTH_TEST);                               // Enable depth testing
        gl.depthFunc(gl.LEQUAL);                                // Near things obscure far things
        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);      // Clear the color as well as the depth buffer.
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.lineWidth(1);
    }
    add( entity : IViewEntity ) {
        this.entities.push(entity);
    }
    render() {
        this.entities.forEach(e => e.render(this));
    }
};

export = View;
