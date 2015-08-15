/// <reference path='./Canvas/Canvas.ts'/>
/// <reference path='./Canvas/Entity.ts'/>
/// <reference path='./view.ts'/>

import View = require('./view')
import ViewEntity = require('./ViewEntity')
import GL = require('./GL/GL')
import ViewModels = require('./ViewModels');
import SVG = require("./SVG/index"); 
import Canvas = require('./Canvas/Canvas');

var Glycerine : any = {
    View: View,
    GL: GL,
    Canvas: Canvas,
    ViewModels: ViewModels,
    SVG : SVG
    //ViewEntity: ViewEntity,    
    //ViewGroup: ViewGroup
    /*  
    UniformsProvider: GlViewEntities.UniformsProvider,

    LineStripEntity: GlViewEntities.LineStripEntity,
    TrianglesEntity: GlViewEntities.TrianglesEntity,
    TriangleStripEntity: GlViewEntities.TriangleStripEntity,
    TriangleFanEntity: GlViewEntities.TriangleFanEntity,
    LinesEntity: GlViewEntities.LinesEntity,
    LineLoopEntity: GlViewEntities.LineLoopEntity,
    PointsEntity:  GlViewEntities.PointsEntity,
    UniformGroup : GlViewEntities.*/
}
export = Glycerine;
