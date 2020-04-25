import * as PIXI from 'pixi.js';
import * as VEC from 'ts-vector';

export class Trail {

	pos: VEC.Vector;
	size: number;
	life: number;
	age: number;
	dead: boolean;
	gfx: PIXI.Graphics;

	constructor(pos: VEC.Vector, size: number, life: number) {
		this.pos = pos;
		this.size = size;
		this.life = life;
		this.age = 0;
		this.dead = false;
		this.gfx = new PIXI.Graphics();
		this.gfx.beginFill(0x9966ff);
		this.gfx.drawCircle(0, 0, size);
		this.gfx.endFill();
	}

	update(dt:number) {
		// The life of a trail
		this.age++;/*deltatime*/
		if (this.age > this.life) {
			this.dead = true;
		}
	}
}