import * as PIXI from 'pixi.js';
import * as VEC from 'ts-vector';

export class Player {

	pos: VEC.Vector;
	size: number;
	cursor: PIXI.Graphics;
	aim: PIXI.Graphics;
	aiming: boolean;

	constructor(pos: VEC.Vector, size: number) {
		this.pos = new VEC.Vector(pos[0], pos[1]);
		this.size = size;
		this.cursor = new PIXI.Graphics();
		this.cursor.lineStyle(1, 0x00ff00);
		this.cursor.drawCircle(0, 0, size);
		this.cursor.position.x = pos[0];
		this.cursor.position.y = pos[1];
		this.aim = new PIXI.Graphics();
		this.aim.lineStyle(1, 0x00ff00);
		this.aiming = false;
	}

	update(dt: number, mousePos: VEC.Vector) {
		this.pos[0] = mousePos[0];
		this.pos[1] = mousePos[1];
		if (this.aiming) {
			this.aim.clear();
			this.aim.lineStyle(1, 0x00ff00);
			this.aim.moveTo(mousePos[0], mousePos[1])
			this.aim.lineTo(this.cursor.position.x, this.cursor.position.y);
		} else {
			this.aim.clear();
			this.cursor.position.x = this.pos[0];
			this.cursor.position.y = this.pos[1];
		}
	}

}
