//import View = require('view')

export interface RenderCallback {
    (): void;
}

export interface ILayer extends IEntity {
    element : HTMLElement; 
    render() : void;
}

export interface IEntity {
    parent : IEntity;
    getLayer() : ILayer; 
    render(t : any): void ;
    prerenderCallbacks : RenderCallback[];    
    getValue(k:string) : any; 
    getProvidedValues() : string[]; 
}

export class EntityBase implements IEntity {
    layer : ILayer = null;
    prerenderCallbacks : RenderCallback[] = [];
    constructor(public parent : IEntity = null) {}
    getLayer() {
	if(this.layer === null)
	    this.layer = this.parent.getLayer(); 
	return this.layer;
    }
    render ( t : any) {
	this.prerenderCallbacks.forEach(cb => cb()); 
    };
    getValue(k:string)  { return this.parent.getValue(k); }
    getProvidedValues() { return this.parent.getProvidedValues(); }
}


export class ObjectUniformsProvider extends EntityBase {
    constructor(public uniformObject : any ={}, parent : IEntity = null) {
	super(parent);
    }
    getValue(k:string) : any {
	if(this.uniformObject && this.uniformObject[k] !== undefined) {
	    var v = this.uniformObject[k];
	    if(v instanceof Function){
		return v.call(this.uniformObject, this); 
	    }
	    return v;
	}
	return this.parent && this.parent.getValue(k);
    }
    getProvidedValues() {
	return Object.keys(this.uniformObject);
    }
    render ( t : any) {
	super.render(t); 
    }
}


export class ViewGroup extends ObjectUniformsProvider {
    constructor(public children: IEntity[] = [], obj : any = {}) {
	super(obj);
	this.children.forEach(c => c.parent = this);
    }
    add( entity : IEntity ) {
        this.children.push(entity);
	entity.parent = this; 
    }
    render( t : any = null) {
	super.render(t); 
        this.children.forEach(e => e.render(t));
    }
}

