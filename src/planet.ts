import * as PIXI from 'pixi.js';
import Victor from 'victor';

export class Planet {

	pos: Victor;
	size: number;
	gfx: PIXI.Graphics;

	constructor(x: number, y: number, size: number) {
		this.pos = new Victor(x, y);
		this.size = size;
		this.gfx = new PIXI.Graphics();
		this.gfx.beginFill(0x660099);
		this.gfx.drawCircle(0, 0, size / 2);
		this.gfx.position.x = this.pos.x;
		this.gfx.position.y = this.pos.y;
	}
}
