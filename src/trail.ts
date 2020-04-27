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
		this.pos = new VEC.Vector(pos[0], pos[1]);
		this.size = size;
		this.life = life;
		this.age = 0;
		this.dead = false;
		this.gfx = new PIXI.Graphics();
		this.gfx.lineStyle(1, 0x00ff00);
		this.gfx.drawCircle(0, 0, size);
		this.gfx.position.x = pos[0];
		this.gfx.position.y = pos[1];
	}

	update(dt: number) {
		// The life of a trail
		this.age += dt;
		if (this.age > this.life) {
			this.dead = true;
		}
	}
}