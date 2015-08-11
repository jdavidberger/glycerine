/// <reference path="./Gl/Gl.ts"/>
/// <reference path="./Gl/entities.ts"/>

import View = require('./view')
import ViewEntity = require('./ViewEntity')
import Gl = require('./Gl/Gl')
import ViewGroup = require('./ViewGroup')
//import GlViewEntities = require('./GlViewEntities')

export = {
    View: View,
    ViewEntity: ViewEntity,
    Gl: Gl,
    ViewGroup: ViewGroup
  /*  
    UniformsProvider: GlViewEntities.UniformsProvider,

    LineStripEntity: GlViewEntities.LineStripEntity,
    TrianglesEntity: GlViewEntities.TrianglesEntity,
    TriangleStripEntity: GlViewEntities.TriangleStripEntity,
    TriangleFanEntity: GlViewEntities.TriangleFanEntity,
    LinesEntity: GlViewEntities.LinesEntity,
    LineLoopEntity: GlViewEntities.LineLoopEntity,
    PointsEntity:  GlViewEntities.PointsEntity,
    UniformGroup : GlViewEntities.UniformGroup*/
}
