import Victor from "victor";
import { STComponent } from "./stComponents";
import { Planet } from "./planet";

export abstract class STObject {
	constructor(
		readonly _pos: Victor,
		readonly _scale: Victor,
		readonly _rotation: number,
		readonly _components: Map<string, STComponent>
	) {}

	stUpdate(dt: number): void {
		for (const c of this._components.values()) c.stUpdate(dt, this);
	}

	stDraw(dt: number): void {
		for (const c of this._components.values()) c.stDraw(dt, this);
	}

	stInit(dt: number): void {
		for (const c of this._components.values()) c.stInit(dt, this);
	}

	AddComponent(c: STComponent): void {
		this._components.set(c._name, c);
	}
}

export class Tank extends STObject {
	floating = true;
	currentPlanet: Planet | undefined;

	constructor(
		pos = new Victor(0, 0),
		size = new Victor(1, 1),
		rotation = 0,
		components = new Map<string, STComponent>()
	) {
		super(pos, size, rotation, components);
	}

	stInit(dt: number): void {
		super.stInit(dt); // Updates component list
	}

	stUpdate(dt: number): void {
		super.stUpdate(dt); // Updates component list
	}
	stDraw(dt: number): void {
		super.stDraw(dt); // Updates component list
	}
}
