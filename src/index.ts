import * as PIXI from 'pixi.js';
import * as VEC from 'ts-vector';
import * as MATH from 'mathjs';
import IO from 'socket.io-client';
import { Planet } from './planet';
import { Shell } from './shell';
import { Trail } from './trail';

const planetMin = 40,
	planetMax = 200,
	planetCount = 25,
	planetBuffer = 80,
	shellSize = 5,
	shellVelRatio = 0.02,
	shellVelHintSize = 6,
	shellAccHintSize = 150,
	trailLife = 500,
	explodeSize = 40,
	explodeLife = 500,
	aimPos = new VEC.Vector(0, 0),
	revealedTime = 100,
	playerSize = 5,
	playerLife = 2000,
	planets = [] as Planet[],
	shells = [] as Shell[],
	trails = [] as Trail[],
	soc = IO.connect(process.env.PORT ? 'https://space-tanks.herokuapp.com/' + process.env.PORT : 'http://localhost:3033');

let app = new PIXI.Application({ backgroundColor: 0x000000, antialias: true, width: window.innerWidth, height: window.innerHeight }),
	timeSinceRevealed = 0,
	camX = 0,
	camY = 0,
	camZ = 1,
	mousePos = new PIXI.Point();

setup();

function setup() {
	// PIXI
	document.body.appendChild(app.view);

	const config = {
		epsilon: 1e-12,
		matrix: 'Matrix',
		number: 'number',
		precision: 64,
		predictable: false,
		randomSeed: "rosebud"
	};
	const math = MATH.create(MATH.all, config as MATH.ConfigOptions);

	// Generate planets
	let packingWidth = window.innerWidth;
	let packingHeight = window.innerHeight;
	do {
		let p = new Planet(
			new VEC.Vector(MATH.random(0, packingWidth), MATH.random(0, packingHeight)),
			MATH.random(planetMin, planetMax)
		);

		// Only save the new planet if it is sutably far from existing planets
		let save = true;
		for (let i = 0; i < planets.length; i++) {
			if (p.pos.subtract(planets[i].pos).magnitude() < planets[i].size + p.size + planetBuffer) {
				save = false;
				packingWidth += 1;
				packingHeight += 1;
			}
		}

		if (save) {
			console.log('Planet(' + p.pos[0] + ',' + p.pos[1] + ')');
			planets.push(p);
			app.stage.addChild(p.gfx);
		}

	} while (planets.length < planetCount)

	soc.on('newShell', function (shellData: Shell) {
		shells.push(new Shell(shellData.pos, shellData.vel, shellData.size));
	})

	soc.on('playerPosUpdate', function (pos: VEC.Vector) {
		newTrail(pos, playerSize, playerLife);
	})

	document.addEventListener('keydown', function (event) {
		if (event.keyCode == 65) {
			console.log('A was pressed');
		}
		else if (event.keyCode == 68) {
			console.log('D was pressed');
		}
		else if (event.keyCode == 69) {
			console.log('E was pressed');
		}
		else if (event.keyCode == 81) {
			console.log('Q was pressed');
		}
		else if (event.keyCode == 83) {
			console.log('S was pressed');
		}
		else if (event.keyCode == 87) {
			console.log('W was pressed');
		}
	});

	document.addEventListener('keyup', function (event) {
		if (event.keyCode == 65) {
			console.log('A was released');
		}
		else if (event.keyCode == 68) {
			console.log('D was released');
		}
		else if (event.keyCode == 69) {
			console.log('E was released');
		}
		else if (event.keyCode == 81) {
			console.log('Q was released');
		}
		else if (event.keyCode == 83) {
			console.log('S was released');
		}
		else if (event.keyCode == 87) {
			console.log('W was released');
		}
	});

	app.ticker.add(delta => update(delta));
}

function newTrail(pos: VEC.Vector, size: number, life: number) {
	let t = new Trail(pos, size, life);
	trails.push(t);
	app.stage.addChild(t.gfx);

}

function newShell(pos: VEC.Vector, vel: VEC.Vector, size: number) {
	let s = new Shell(pos, vel, size);
	shells.push(s);
	app.stage.addChild(s.gfx);
	var shellData = {
		px: pos[0],
		py: pos[1],
		vx: vel[0],
		vy: vel[1],
		s: size
	}
	soc.emit('newShell', shellData);
}

function update(dt: number) {
	mousePos = app.renderer.plugins.interaction.mouse.global;
	// Update shells and trails and add new trails
	for (let i = 0; i < shells.length; i++) {
		newTrail(shells[i].pos, shellSize, trailLife);
		shells[i].update(planets, dt);
	}
	for (let i = 0; i < trails.length; i++)
		trails[i].update(dt);
	// Remove dead things
	let i = 0;
	while (i < shells.length) {
		if (shells[i].dead) {
			newTrail(shells[i].pos, explodeSize, explodeLife);
			shells.splice(i, 1);
			continue;
		}
		i++
	}
	i = 0;
	while (i < trails.length) {
		if (trails[i].dead) {
			trails.splice(i, 1);
			continue;
		}
		i++
	}
	// Marco!
	if ((timeSinceRevealed += dt) > revealedTime) {
		timeSinceRevealed = 0.0;
		var playerPosData = {
			px: mousePos.x,
			py: mousePos.y
		}
		soc.emit('playerPosUpdate', playerPosData);
	}
	// Polo!
	if (timeSinceRevealed == 0.0)
		newTrail(new VEC.Vector(mousePos.x, mousePos.y), playerSize, playerLife);
}

// function camTX(x: number) {
// 	return (x - camX + window.innerWidth / 2) / camZ;
// }

// function camTY(y: number) {
// 	return (y - camY + window.innerHeight / 2) / camZ;
// }

// function camMX(x: number) {
// 	return camX + x * camZ - window.innerWidth / 2;
// }

// function camMY(y: number) {
// 	return camY + y * camZ - window.innerHeight / 2;
// }

// function camSZ(s: number) {
// 	return s / camZ;
// }
