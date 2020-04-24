import * as VEC from 'ts-vector';

export class Planet {

	pos:VEC.Vector;
	size:number;

	constructor(pos:VEC.Vector, size:number){
		this.pos = pos;
		this.size = size;
	}
}
