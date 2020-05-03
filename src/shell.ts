import * as PIXI from 'pixi.js';
import Victor from 'victor';
import { Planet } from './planet';
import * as PARTICLE from 'pixi-particles';


const G = 400, RSQ_SCALER = 1;

export class Shell {

	pos: Victor;
	vel: Victor;
	acc: Victor;
	size: number;
	dead: boolean;
	sprite: PIXI.Sprite;
	emitter: PARTICLE.Emitter;

	constructor(x: number, y: number, size: number, vx: number, vy: number, sprite: PIXI.Sprite, particleContainer: PIXI.Container) {
		this.pos = new Victor(x, y);
		this.vel = new Victor(vx, vy);
		this.acc = new Victor(0, 0);
		this.size = size;
		this.dead = false;
		this.sprite = sprite;
		this.sprite.position.x = x;
		this.sprite.position.y = y;
		this.sprite.angle = this.vel.angleDeg();
		this.sprite.scale.set(1, 1);
		this.sprite.pivot.set(this.sprite.width, this.sprite.height / 2);
		this.emitter = new PARTICLE.Emitter(particleContainer, PIXI.Loader.shared.resources['whiteSquare25'].texture, {
			"alpha": { // How do I keep this in a seperate file?
				"start": 1,
				"end": 0
			},
			"scale": {
				"start": 1,
				"end": 0.33,
				"minimumScaleMultiplier": 1
			},
			"color": {
				"start": "#ff0000",
				"end": "#ffff00"
			},
			"speed": {
				"start": 0,
				"end": 0,
				"minimumSpeedMultiplier": 1
			},
			"maxSpeed": 0,
			"startRotation": {
				"min": 0,
				"max": 0
			},
			"noRotation": false,
			"rotationSpeed": {
				"min": 1200,
				"max": -1200
			},
			"lifetime": {
				"min": 0.25,
				"max": 0.5
			},
			"blendMode": "normal",
			"frequency": 0.01,
			"emitterLifetime": -1,
			"maxParticles": 50,
			"pos": {
				"x": 0,
				"y": 0
			},
			"addAtBack": false,
			"spawnType": "circle",
			"emit": false,
			"spawnCircle": {
				"x": 0,
				"y": 0,
				"r": this.sprite.height / 2
			}
		});
	}

	stUpdate(planets: Planet[], dt: number) {
		// Before update
		this.doPhysics(planets, dt);
		this.doCollisions(planets);
		this.updateComponents();

		// After update
		this.emitter.emit = true;
		this.emitter.update(dt);
	}

	// Housekeeping to keep components in sync
	updateComponents() {
		this.sprite.position.x = this.pos.x;
		this.sprite.position.y = this.pos.y;
		this.sprite.angle = this.vel.angleDeg();

		let p = new PIXI.Point(0, this.sprite.height / 2);
		this.sprite.localTransform.apply(p, p);
		this.emitter.updateOwnerPos(p.x, p.y);
		this.emitter.rotate(this.sprite.angle);
	}

	doPhysics(planets: Planet[], dt: number) {
		// Aggregate forces from planets
		let force = new Victor(0, 0);
		for (let i = 0; i < planets.length; i++) {
			force.add(this.getForce(planets[i]));
		}
		// "Do physics"
		//force.divideScalar(this.size);
		this.acc.copy(force);
		this.vel.add(this.acc.clone().multiplyScalar(dt));
		this.pos.add(this.vel.clone().multiplyScalar(dt));
	}

	getForce(planet: Planet) {
		// Force due to gravity = (G * m1 * m2) / (r * r)
		// in the direction of the source of gravity
		let rSq = planet.pos.distanceSq(this.pos) * RSQ_SCALER;

		let f = planet.pos.clone();
		f.subtract(this.pos);
		f.normalize();
		f.multiplyScalar(G * planet.size * planet.size * this.size / rSq);
		return f;
	}

	doCollisions(planets: Planet[]) {
		for (let i = 0; i < planets.length; i++)
			if (this.collide(planets[i]))
				this.dead = true;
	}

	collide(planet: Planet) {
		// Using the square of the magnitude avoids a square root calculation
		let r = planet.size / 2 + this.size / 2;
		return this.pos.distanceSq(planet.pos) < r * r;
	}
}
