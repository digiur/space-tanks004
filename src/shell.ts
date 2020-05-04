import * as MATH from "mathjs";
import * as PIXI from "pixi.js";
import * as PARTICLE from "pixi-particles";
import * as SMOKE from "./emitters/shellSmoke.json";
import * as EXHAUST from "./emitters/shellExhaust.json";
import * as STARS from "./emitters/shellStars.json";
import * as EXPLOSION from "./emitters/shellExplosion.json";
import Victor from "victor";
import { Planet } from "./planet";
import { WorldCamera } from "./worldCamera";

const G = 400,
	RSQ_SCALER = 1;

export class Shell {
	pos: Victor;
	vel: Victor;
	acc: Victor;
	size: number;
	dead: boolean;
	readyForDelete: boolean;
	sprite: PIXI.Sprite;
	exhaust: PARTICLE.Emitter;
	stars: PARTICLE.Emitter;
	smoke: PARTICLE.Emitter;
	explosion: PARTICLE.Emitter;
	life: number;

	constructor(
		x: number,
		y: number,
		size: number,
		vx: number,
		vy: number,
		sprite: PIXI.Sprite,
		world: WorldCamera,
		life: number
	) {
		this.life = life;
		this.pos = new Victor(x, y);
		this.vel = new Victor(vx, vy);
		this.acc = new Victor(0, 0);
		this.size = size;
		this.dead = false;
		this.readyForDelete = false;
		this.sprite = sprite;
		this.sprite.position.x = x;
		this.sprite.position.y = y;
		this.sprite.angle = this.vel.angleDeg();
		this.sprite.scale.set(1, 1);
		this.sprite.pivot.set(this.sprite.width, this.sprite.height / 2);
		this.stars = new PARTICLE.Emitter(
			world.getLayer("particle-0"),
			PIXI.Loader.shared.resources["star"].texture,
			STARS
		);
		this.explosion = new PARTICLE.Emitter(
			world.getLayer("particle-1"),
			PIXI.Loader.shared.resources["fire"].texture,
			EXPLOSION
		);
		this.exhaust = new PARTICLE.Emitter(
			world.getLayer("particle-2"),
			PIXI.Loader.shared.resources["whiteSquare50"].texture,
			EXHAUST
		);
		this.smoke = new PARTICLE.Emitter(
			world.getLayer("particle-2"),
			PIXI.Loader.shared.resources["smoke"].texture,
			SMOKE
		);
	}

	stUpdate(planets: Planet[], dt: number): void {
		if (this.dead) return;
		this.doPhysics(planets, dt);
		this.doCollisions(planets);
		this.updateComponents();
		if (!this.exhaust.emit && !this.dead) this.exhaust.emit = true;

		if ((this.life -= dt) <= 0) this.die();
	}

	die(): void {
		const p = new PIXI.Point(0, this.sprite.height / 2);
		this.sprite.localTransform.apply(p, p);
		this.sprite.visible = false;
		this.exhaust.emit = false;

		this.explosion.updateOwnerPos(p.x, p.y);
		this.smoke.updateOwnerPos(p.x, p.y);
		this.stars.updateOwnerPos(p.x, p.y);

		this.smoke.playOnceAndDestroy(() => {
			//"smoke over"
		});
		this.explosion.playOnceAndDestroy(() => {
			//"explode over"
		});
		this.stars.playOnceAndDestroy(() => {
			//"stars over"
		});
		this.dead = true;
	}

	// Housekeeping to keep components in sync
	updateComponents(): void {
		this.sprite.position.x = this.pos.x;
		this.sprite.position.y = this.pos.y;
		this.sprite.angle = this.vel.angleDeg();
		const p = new PIXI.Point(0, this.sprite.height / 2);
		this.sprite.localTransform.apply(p, p);
		this.exhaust.updateOwnerPos(p.x, p.y);
		this.exhaust.rotate(this.sprite.angle);
	}

	doPhysics(planets: Planet[], dt: number): void {
		// Aggregate forces from planets
		const force = new Victor(0, 0);
		for (let i = 0; i < planets.length; i++) {
			force.add(this.getForce(planets[i]));
		}
		// "Do physics"
		//force.divideScalar(this.size);
		this.acc.copy(force);
		this.vel.add(this.acc.clone().multiplyScalar(dt));
		this.pos.add(this.vel.clone().multiplyScalar(dt));
	}

	getForce(planet: Planet): Victor {
		// Force due to gravity = (G * m1 * m2) / (r * r)
		// in the direction of the source of gravity
		const rSq = planet.pos.distanceSq(this.pos) * RSQ_SCALER;
		return planet.pos
			.clone()
			.subtract(this.pos)
			.normalize()
			.multiplyScalar(
				(G * MATH.pi * planet.size * planet.size * this.size) / rSq
			);
	}

	doCollisions(planets: Planet[]): void {
		for (let i = 0; i < planets.length; i++)
			if (this.collide(planets[i])) this.die();
	}

	collide(planet: Planet): boolean {
		// Using the square of the magnitude avoids a square root calculation
		const r = planet.size + this.size;
		return this.pos.distanceSq(planet.pos) < r * r;
	}
}
