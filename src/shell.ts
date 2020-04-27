import * as PIXI from 'pixi.js';
import * as VEC from 'ts-vector';
import { Planet } from './planet';

let G = 20;

export class Shell {

	pos: VEC.Vector;
	vel: VEC.Vector;
	acc: VEC.Vector;
	force: VEC.Vector;
	size: number;
	dead: boolean;
	gfx: PIXI.Graphics;

	constructor(pos: VEC.Vector, size: number, vel: VEC.Vector) {
		this.pos = new VEC.Vector(pos[0],pos[1]);
		this.vel = new VEC.Vector(vel[0],vel[1]);
		this.acc = new VEC.Vector(0, 0);
		this.force = new VEC.Vector(0, 0);
		this.size = size;
		this.dead = false;
		this.gfx = new PIXI.Graphics();
		this.gfx.beginFill(0x9966ff);
		this.gfx.drawCircle(0, 0, size);
		this.gfx.endFill();
		this.gfx.position.x = pos[0];
		this.gfx.position.y = pos[1];
	}

	update(planets: Planet[], dt: number) {
		this.doPhysics(planets, dt);
		this.doCollisions(planets);
		this.gfx.position.x = this.pos[0];
		this.gfx.position.y = this.pos[1];
	}

	doPhysics(planets: Planet[], dt: number) {
		// Aggregate forces from planets
		this.force[0] = 0;
		this.force[1] = 0;
		for (let i = 0; i < planets.length; i++){
			let v = this.getForce(planets[i]);
			this.force.addSelf(v);
		}

		// "Do physics"
		this.acc = this.force.divide(this.size).multiply(dt);
		this.vel.addSelf(this.acc.multiply(dt));
		this.pos.addSelf(this.vel.multiply(dt));
	}

	getForce(planet: Planet) {
		// Force due to gravity = (G * m1 * m2) / (r * r)
		// in the direction of the source of gravity
		return planet.pos.subtract(this.pos).normalizeVector().multiply(G * this.size * planet.size / this.pos.subtract(planet.pos).sumOfSquares());
	}

	doCollisions(planets: Planet[]) {
		for (let i = 0; i < planets.length; i++)
			if (this.collideSq(planets[i]))
				this.dead = true;
	}

	collideSq(planet: Planet) {
		// Using the square of the magnitude avoids a square root calculation
		let r1 = planet.size / 2;
		let r2 = this.size / 2;
		return this.pos.subtract(planet.pos).sumOfSquares() < (r1 + r2) * (r1 + r2);
	}
}
