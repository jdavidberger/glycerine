/// <reference path="./Canvas"/>
import ViewEntity = require("../ViewEntity"); 
import LayerModule = require("./Layer");

export class Entity extends ViewEntity.EntityBase {
    render(ctx : CanvasRenderingContext2D) {
	
    }
    getLayer() : LayerModule.Layer {
	return <LayerModule.Layer> super.getLayer();
    }

};
