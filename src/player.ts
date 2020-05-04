import * as PIXI from "pixi.js";
import Victor from "victor";

export class Player {
	pos: Victor;
	size: number;
	cursor: PIXI.Graphics;
	aim: PIXI.Graphics;
	aiming: boolean;

	constructor(x: number, y: number, size: number) {
		this.pos = new Victor(x, y);
		this.size = size;
		this.cursor = new PIXI.Graphics();
		this.cursor.lineStyle(1, 0x00ff00);
		this.cursor.drawCircle(0, 0, size);
		this.cursor.position.x = this.pos.x;
		this.cursor.position.y = this.pos.y;
		this.aim = new PIXI.Graphics();
		this.aim.lineStyle(1, 0x00ff00);
		this.aiming = false;
	}

	stUpdate(dt: number, mousePos: Victor): void {
		this.pos.copy(mousePos);
		if (this.aiming) {
			this.aim.clear();
			this.aim.lineStyle(1, 0x00ff00);
			this.aim.moveTo(mousePos.x, mousePos.y);
			this.aim.lineTo(this.cursor.position.x, this.cursor.position.y);
		} else {
			this.aim.clear();
			this.cursor.position.x = this.pos.x;
			this.cursor.position.y = this.pos.y;
		}
	}

	setAiming(): void {
		this.aiming = true;
	}

	setNotAiming(): void {
		this.aiming = false;
	}
}
