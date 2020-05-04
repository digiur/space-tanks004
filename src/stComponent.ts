import * as PIXI from "pixi.js";
import { STObject } from "./stObject";

export abstract class STComponent {
	constructor(readonly _name: string) {}
	abstract stUpdate(dt: number, gameObject: STObject): void;
	abstract stDraw(dt: number, gameObject: STObject): void;
	abstract stInit(dt: number, gameObject: STObject): void;
}

export class STSprite extends STComponent {
	constructor(name: string, public sprite = new PIXI.Sprite()) {
		super(name);
	}

	stInit(dt: number, gameObject: STObject): void {
		return;
	}

	stUpdate(dt: number, gameObject: STObject): void {
		this.sprite.position.set(gameObject._pos.x, gameObject._pos.y);
		this.sprite.scale.set(gameObject._scale.x, gameObject._scale.y);
		this.sprite.rotation = gameObject._rotation;
	}

	stDraw(dt: number, gameObject: STObject): void {
		return;
	}
}
