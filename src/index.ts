import * as PIXI from 'pixi.js';
import * as VEC from 'ts-vector';
import * as MATH from 'mathjs';
import IO from 'socket.io-client';
import { Viewport } from 'pixi-viewport'
import { Planet } from './planet';
import { Shell } from './shell';
import { Trail } from './trail';
import { Player } from './player';

console.log('origin');

const planetMin = 40,
	planetMax = 200,
	planetCount = 25,
	planetBuffer = 80,
	shellSize = 5,
	trailSize = 2,
	shellVelRatio = 0.02,
	trailLife = 25,
	explodeSize = 20,
	explodeLife = 50,
	playerSize = 10,
	rotateSpeed = 0.01,
	planets = [] as Planet[],
	shells = [] as Shell[],
	trails = [] as Trail[],
	players = [] as Trail[],
	pixi = new PIXI.Application({ backgroundColor: 0x000000, antialias: true, width: window.innerWidth, height: window.innerHeight }),
	soc = IO.connect(process.env.PORT ? 'https://space-tanks.herokuapp.com/' + process.env.PORT : 'http://localhost:3033'),
	world = new PIXI.Container,
	viewport = new Viewport({
		screenWidth: window.innerWidth,
		screenHeight: window.innerHeight,
		worldWidth: 10000,
		worldHeight: 10000,
		interaction: pixi.renderer.plugins.interaction // the interaction module is important for wheel to work properly when renderer.view is placed or scaled, or so I'm told
	}),
	myPlayer = newPlayer();

let timeSinceRevealed = 0,
	aimPos = new VEC.Vector(0, 0),
	mousePos = new VEC.Vector(0, 0);

console.log('starting config');

// PIXI
document.body.appendChild(pixi.view);

pixi.stage.interactive = true;
pixi.stage.hitArea = new PIXI.Rectangle(0, 0, window.innerWidth, window.innerHeight);
pixi.stage.addChild(viewport);
viewport.addChild(world);

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
console.log('Generate planets');
let packingWidth = window.innerWidth;
let packingHeight = window.innerHeight;
do { // Wow, a do while loop in the wild...
	let p = new Planet(
		new VEC.Vector(MATH.random(0, packingWidth), MATH.random(0, packingHeight)),
		MATH.random(planetMin, planetMax) / 2
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
		world.addChild(p.gfx);
	}

} while (planets.length < planetCount)

// soc.on('newShell', function (shellData: Shell) {
// 	shells.push(new Shell( pos: shellData.pos, size: shellData.vel, vel: shellData.size }));
// })

// soc.on('playerPosUpdate', function (pos: VEC.Vector) {
// 	newTrail(pos, playerSize, playerLife);
// })

document.addEventListener('keydown', function (event) {
	if (event.keyCode == 65) { //A
		console.log('A was pressed');
	}
	else if (event.keyCode == 68) { //D
		console.log('D was pressed');
	}
	else if (event.keyCode == 69) { //E
		console.log('E was pressed');
	}
	else if (event.keyCode == 81) { //Q
		console.log('Q was pressed');
	}
	else if (event.keyCode == 83) { //S
		console.log('S was pressed');
	}
	else if (event.keyCode == 87) { //W
		console.log('W was pressed');
	}
});

document.addEventListener('keyup', function (event) {
	if (event.keyCode == 65) { //A
		console.log('A was released');
	}
	else if (event.keyCode == 68) { //D
		console.log('D was released');
	}
	else if (event.keyCode == 69) { //E
		console.log('E was released');
	}
	else if (event.keyCode == 81) { //Q
		console.log('Q was released');
	}
	else if (event.keyCode == 83) { //S
		console.log('S was released');
	}
	else if (event.keyCode == 87) { //W
		console.log('W was released');
	}
});

pixi.stage.on('mousedown', function () {
	aimPos[0] = mousePos[0];
	aimPos[1] = mousePos[1];
	myPlayer.aiming = true;
});

pixi.stage.on('mouseup', function () {
	newShell(aimPos, shellSize, aimPos.subtract(mousePos).multiplySelf(shellVelRatio));
	myPlayer.aiming = false;
});

pixi.stage.on('mousemove', function () {
});

pixi.stage.on('mouseover', function () {
});

pixi.ticker.add(delta => update(delta));

function update(dt: number) {
	
	// world.pivot.x = viewport.x;
	// world.pivot.y = viewport.y;
	//world.rotation += rotateSpeed * dt;
	
	// activate plugins
	//viewport.drag()
	
	mousePos[0] = pixi.renderer.plugins.interaction.mouse.global.x;
	mousePos[1] = pixi.renderer.plugins.interaction.mouse.global.y;
	// Update shells and trails and add new trails
	for (let i = 0; i < shells.length; i++) {
		newTrail(shells[i].pos, trailSize, trailLife);
		shells[i].update(planets, dt);
	}
	for (let i = 0; i < trails.length; i++) {
		trails[i].update(dt);
	}
	myPlayer.update(dt, mousePos);

	// Remove dead things
	let i = 0;
	while (i < shells.length) {
		if (shells[i].dead) {
			newTrail(shells[i].pos, explodeSize, explodeLife);
			shells[i].gfx.destroy();
			shells.splice(i, 1);
			continue;
		}
		i++
	}
	i = 0;
	while (i < trails.length) {
		if (trails[i].dead) {
			trails[i].gfx.destroy();
			console.log('dead trail')
			trails.splice(i, 1);
			continue;
		}
		i++
	}
	// // Marco!
	// if ((timeSinceRevealed += dt) > revealedTime) {
	// 	timeSinceRevealed = 0.0;
	// 	var playerPosData = {
	// 		px: mousePos[0],
	// 		py: mousePos[1]
	// 	}
	// 	soc.emit('playerPosUpdate', playerPosData);
	// }
	// // Polo!
	// if (timeSinceRevealed == 0.0)
	// 	newTrail(new VEC.Vector(mousePos[0], mousePos[1]), playerSize, playerLife);
}

function newShell(pos: VEC.Vector, size: number, vel: VEC.Vector) {
	let s = new Shell(pos, size, vel);
	shells.push(s);
	world.addChild(s.gfx);
	// var shellData = {
	// 	px: pos[0],
	// 	py: pos[1],
	// 	vx: vel[0],
	// 	vy: vel[1],
	// 	s: size
	// }
	// soc.emit('newShell', shellData);
	return s;
}

function newTrail(pos: VEC.Vector, size: number, life: number) {
	let t = new Trail(pos, size, life);
	trails.push(t);
	world.addChild(t.gfx);
	return t;
}

function newPlayer() {
	let p = new Player(new VEC.Vector(), playerSize);
	world.addChild(p.aim);
	world.addChild(p.cursor);
	return p;
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
