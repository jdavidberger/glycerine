
export interface IViewModel {    
    getBox(): BoundingBox; 
    get3x3( o? : BoundingBox );
    get4x4() : number[];
}

export interface BoundingBox {
    left: number;
    right: number;
    top: number;
    bottom: number;
};

export class ViewModel2D implements IViewModel {
    constructor(public _box : BoundingBox) {
	
    }
    
    box(b? : BoundingBox) {
	if(b !== undefined) 
	    this._box = b;
	return Object.create(this._box);
    }
    getBox(): BoundingBox {
	return this._box; 
    }
    right(v? : number) : number {
	if(v !== undefined) 
	    this._box.right = v; 
	return this._box.right; 
    }

    get4x4() : number[] {
	var left = this._box.left; 
	var right = this._box.right;
	var bottom = this._box.bottom;
	var top = this._box.top; 
	var near = -1; 
	var far = 1; 

	var lr = 1 / (left - right),
        bt = 1 / (bottom - top),
        nf = 1 / (near - far);
	return  [ -2 * lr,       0,    0, 0,
	          0, -2 * bt,    0, 0,
	          0,       0, 2*nf,   0,
		  (left + right) * lr, (top + bottom) * bt, (far + near) * nf, 1];
    }
    get3x3(o : BoundingBox = {left: -1, right: 1, top:1, bottom:-1 }) : number[] {
	var left = this._box.left; 
	var right = this._box.right;
	var bottom = this._box.bottom;
	var top = this._box.top; 

	var lr = (o.left - o.right) / (left - right), 
            bt = (o.bottom - o.top) / (bottom - top);

	return  [ lr,       0, 0,
       	          0, bt, 0,
		  o.left - left * lr, o.top - top * bt, 1 ]
    }
    transformTo([x,y] : [number,number], to : BoundingBox = {left: -1, right: 1, top:1, bottom:-1 }) : [number,number]{
	var from = this._box; 
	var left = to.left; 
	var right = to.right;
	var bottom = to.bottom;
	var top = to.top; 

	var lr = (from.left - from.right) / (left - right), 
            bt = (from.bottom - from.top) / (bottom - top);

	return [ lr * x + from.left - left * lr,
		 bt * y + from.top - top * bt ];	
    }
};
