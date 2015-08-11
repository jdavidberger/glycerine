

import entities = require ("./entities")

var e : any = {};
var _entities : any = entities; 
for(var n in _entities) {
    e[n] = _entities[n]; 
}


export = e;
