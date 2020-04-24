import * as VEC from 'ts-vector';

export class Trail {

	pos: VEC.Vector;
	size: number;
	life: number;
	age: number;
	dead: boolean;

	constructor(pos: VEC.Vector, size: number, life: number) {
		this.pos = pos;
		this.size = size;
		this.life = life;
		this.age = 0;
		this.dead = false;
	}

	update() {
		// The life of a trail
		this.age++;
		if (this.age > this.life) {
			this.dead = true;
		}
	}

	draw() {
	}
}