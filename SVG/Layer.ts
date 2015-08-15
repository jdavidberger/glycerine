import CoreLayer = require('../Layer');
import View = require('../View');
import ViewEntities = require("../ViewEntity"); 
import IEntity = ViewEntities.IEntity; 
import ViewModels = require("../ViewModels");

declare var require : any;
var $ = require("jquery")

function translateToKeepPositionForScale([cx, cy], scalex, scaley) {
    var tx= -cx * (scalex-1);
    var ty= -cy * (scaley-1);                        
    return [tx,ty]; 
}

class Layer extends CoreLayer.Layer< SVGGElement, HTMLDivElement> {   
    svg : SVGSVGElement;
    constructor(public viewModel : ViewModels.IViewModel, 
		children : IEntity[], 
		zIndex : number = 0) {
	super("div", children, zIndex); 
	this.svg = <SVGSVGElement> document.createElementNS("http://www.w3.org/2000/svg", "svg");
	this.ctx = <SVGGElement> document.createElementNS("http://www.w3.org/2000/svg", "g");
	this.element.appendChild(this.svg);
	this.svg.appendChild(this.ctx);
	$(this.element).resize(function() {
	    this.updateView();
	}.bind(this));
    }
    add( node : any ) {
	if(node instanceof SVGTextElement) {
	    var tx = node.getAttribute("transform") || "";
	    node.setAttribute("y",  -parseInt(node.getAttribute("y")) + ""); 
	    node.setAttribute("transform", tx + " scale(1,-1)");
	}
	node.setAttribute("original-transform", node.getAttribute('transform') || " ");
	this.ctx.appendChild(node);
    }
    updateView() {
	var box = this.viewModel.getBox();
	
	this.svg.setAttribute("width", ""+this.element.clientWidth);
	this.svg.setAttribute("height", ""+this.element.clientHeight);

	var [w,h] = [this.element.clientWidth, this.element.clientHeight ];

	var mat = this.viewModel.get3x3({left: 0, right: w, top: 0, bottom: h });
	var str = [mat[0], mat[1], 
		   mat[3], mat[4], 
		   mat[6], mat[7] ].map(m=>""+m).join(',');
	
	this.ctx.setAttribute("transform", "matrix( " + str + ")");

	$("*", this.ctx).each(function(idx, element) {
	    if(element.tagName != 'g' ) {
		var [x,y] = [parseInt(element.getAttribute('x') || element.getAttribute('cx')), 
			     parseInt(element.getAttribute('y') || element.getAttribute('cy'))];
		var t = element.getAttribute('original-transform') || 
		    element.getAttribute('transform') || "";
		if(x === undefined || y === undefined || isNaN(x) || isNaN(y))
		    return;

		if(element instanceof SVGTextElement)
		    y = -y;
		var sx = -mat[4];
		var sy = mat[0];
		var ds = Math.sqrt(sx*sx + sy*sy);
		sx = sx / ds; 
		sy = sy / ds;
		var tr = translateToKeepPositionForScale([x,y], sx, sy);
		element.setAttribute('transform', 'translate(' + tr[0] + ", " + tr[1] + ') scale(' + sx + ', ' + sy + ') ' + t);
	    }
	});	
    }
    render() {
	super.render();	
    }
}

export = Layer
