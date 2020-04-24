import * as VEC from 'ts-vector';
import { Planet } from './planet';

let G = 20;

export class Shell {

	pos:VEC.Vector;
	vel:VEC.Vector;
	acc:VEC.Vector;
	force:VEC.Vector;
	size:number;
	dead:boolean;

	constructor(pos:VEC.Vector, vel:VEC.Vector, size:number) {
		this.pos = pos;
		this.vel = vel;
		this.acc = new VEC.Vector(0, 0);
		this.force = new VEC.Vector(0, 0);
		this.size = size;
		this.dead = false;
	}

	update(planets:Planet[]) {
		this.doPhysics(planets);
		this.doCollisions(planets);
	}

	doPhysics(planets:Planet[]) {

		// Aggregate forces from planets
		this.force.equals([0, 0]);
		for (let i = 0; i < planets.length; i++)
			this.force.add(this.getForce(planets[i]));

		// "Do physics"
		this.acc.equals(this.force.divide(this.size));
		this.vel.add(this.acc);
		this.pos.add(this.vel);
	}

	getForce(planet:Planet) {
		// Force due to gravity = (G * m1 * m2) / (r * r)
		// in the direction of the source of gravity
		let dir = VEC.Vector.subtract(planet.pos, this.pos).normalizeVector();
		return dir.multiply((G * this.size * planet.size) / VEC.Vector.subtract(this.pos, planet.pos).sumOfSquares());
	}

	doCollisions(planets:Planet[]) {
		for (let i = 0; i < planets.length; i++)
			if (this.collideSq(planets[i]))
				this.dead = true;
	}

	collide(planet:Planet) {
		if (VEC.Vector.subtract(this.pos, planet.pos).sumOfSquares() < ((planet.size / 2 + this.size / 2) * (planet.size / 2 + this.size / 2)))
			return true
		else
			return false;
	}

	collideSq(planet:Planet) {
		// Using the square of the magnitude avoids a square root calculation
		let r1 = planet.size / 2;
		let r2 = this.size / 2;
		if (VEC.Vector.subtract(this.pos, planet.pos).sumOfSquares() < (r1 + r2) * (r1 + r2))
			return true
		else
			return false;
	}

	draw() {

	}
}
