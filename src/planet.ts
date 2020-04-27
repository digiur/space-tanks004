import * as PIXI from 'pixi.js';
import * as VEC from 'ts-vector';

export class Planet {

	pos: VEC.Vector;
	size: number;
	gfx: PIXI.Graphics;

	constructor(pos: VEC.Vector, size: number) {
		this.pos = new VEC.Vector(pos[0],pos[1]);
		this.size = size;
		this.gfx = new PIXI.Graphics();
		this.gfx.beginFill(0x9966ff);
		this.gfx.drawCircle(0, 0, size/2);
		this.gfx.position.x = pos[0];
		this.gfx.position.y = pos[1];
	}
}
