import CoreLayer = require('../Layer');
import View = require('../View');
import ViewEntities = require("../ViewEntity"); 
import IEntity = ViewEntities.IEntity; 
import ViewModels = require("../ViewModels");

export class CanvasBasedLayer<ContextT> extends CoreLayer.Layer< ContextT, HTMLCanvasElement > {   
    constructor(children : IEntity[], 
		contextName : string, 
		zIndex : number = 0,
		obj : any = {}) {
	super("canvas", children, zIndex, obj); 
	this.ctx = <ContextT> <any>this.element.getContext(contextName); 	
    }
}

export class Layer extends CanvasBasedLayer< CanvasRenderingContext2D > {   
    constructor(public viewModel : ViewModels.IViewModel, 
		children : IEntity[] = [], 
		zIndex : number = 0) {
	super(children, "2d", zIndex); 	
    }
    clear() {
	this.ctx.save();
	this.ctx.setTransform(1,0,0,1,0,0);
	this.ctx.clearRect(0,
			   0,
			   this.element.width,
			   this.element.height);
	this.ctx.restore();
    }
    getDrawingBounds() {
	return this.viewModel.getBox();
    }
    render() {
	var w = this.element.width;
	var h = this.element.height;

	var mat = this.viewModel.get3x3({left:0,right:w,top:0,bottom:h});

	this.ctx.setTransform(mat[0], mat[1], mat[3], mat[4], 
			      mat[6], mat[7]); 
	super.render();
    }
}
