import * as PIXI from 'pixi.js';
import * as MATH from 'mathjs';
import IO from 'socket.io-client';
import Victor from 'victor';
import { Planet } from './planet';
import { Shell } from './shell';
import { Player } from './player';
import { WorldCamera } from './worldCamera';

const
	shellSize = 10,
	playerSize = 10,
	planetMin = 2000,
	planetMax = 8500,
	planetCount = 20,
	planetBuffer = 1800,
	shellVelRatio = 1,
	shells = [] as Shell[],
	planets = [] as Planet[],
	pixi = new PIXI.Application({ backgroundColor: 0x000000, antialias: true, width: window.innerWidth, height: window.innerHeight }),
	FPS = new PIXI.Text('FPS', { fontSize: 36, fill: "black", stroke: '#ffffff', strokeThickness: 2 }),
	world = new WorldCamera(pixi),
	myTicker = new PIXI.Ticker,
	myPlayer = newPlayer()

let
	aimPos = new Victor(0, 0),
	mousePos = new Victor(0, 0),
	frame = 0;

// Sign up for loader events
PIXI.Loader.shared.onError.add(() => { console.log('LOAD ERROR'); });
PIXI.Loader.shared.onLoad.add(() => { console.log('File Loaded...'); });
PIXI.Loader.shared.onComplete.add(() => { console.log('Load finished!'); });

// Loader
PIXI.Loader.shared
	.add('missle', 'missle.png')
	.add('whiteSquare25', 'Pixel25.png')
	.add('whiteSquare50', 'Pixel50.png')
	.add('whiteSquare100', 'Pixel100.png')
	.load(stInit);

function stInit() {

	console.log(new Victor(0,0));

	//On the eighth day the gods created
	document.body.appendChild(pixi.view);
	pixi.stage.interactive = true;
	pixi.stage.hitArea = new PIXI.Rectangle(0, 0, window.innerWidth, window.innerHeight);
	pixi.stage.addChild(FPS);
	FPS.position.set(20, 20);
	world.addLayer('particles');
	world.addLayer('planets');

	// Generate planets
	console.log('Generate planets');
	MATH.create(MATH.all, { randomSeed: "ichor" });
	let packingWidth = window.innerWidth;
	let packingHeight = window.innerHeight;
	do { // Wow, a do while loop in the wild...
		let p = new Planet(
			MATH.random(-packingWidth / 2, packingWidth / 2),
			MATH.random(-packingHeight / 2, packingHeight / 2),
			MATH.random(planetMin, planetMax)
		);
		// Only save the new planet if it is sutably far from existing planets
		let save = true;
		for (let i = 0; i < planets.length; i++) {
			if (p.pos.clone().subtract(planets[i].pos).magnitude() < planets[i].size + p.size + planetBuffer) {
				save = false;
				packingWidth += 1;
				packingHeight += 1;
			}
		}
		if (save) {
			console.log('New Planet(' + p.pos.x + ',' + p.pos.y + ')');
			planets.push(p);
			world.addChild(p.gfx, 'planets');
		}
	} while (planets.length < planetCount)

	// Show world border
	let worldBorder = new PIXI.Graphics;
	let container = world.getLayer('planets');
	let x = container.width / 2;
	let y = container.height / 2;
	worldBorder.lineStyle(5, 0xff0000);
	worldBorder.moveTo(-x, y);
	worldBorder.lineTo(-x, -y);
	worldBorder.lineTo(x, -y);
	worldBorder.lineTo(x, y);
	worldBorder.lineTo(-x, y);
	world.addChild(worldBorder);
	world.camera.scale.set(0.25, 0.25);

	// Start stUpdate
	myTicker.minFPS = 30;
	myTicker.maxFPS = 60;
	myTicker.add(stUpdate);
	myTicker.start();
}

// Main update loop
function stUpdate() {
	let deltaSEC = myTicker.deltaMS / 1000;
	let p = new PIXI.Point(pixi.renderer.plugins.interaction.mouse.global.x, pixi.renderer.plugins.interaction.mouse.global.y);
	p = world.screenToWorld(p)
	mousePos.x = p.x;
	mousePos.y = p.y;

	for (let i = 0; i < shells.length; i++)
		shells[i].stUpdate(planets, deltaSEC);

	myPlayer.stUpdate(deltaSEC, mousePos);

	let i = 0;
	while (i < shells.length) {
		if (shells[i].dead) {
			shells[i].sprite.destroy();
			shells[i].emitter.destroy();
			shells.splice(i, 1);
			continue;
		}
		i++
	}
	i = 0;
	world.update(deltaSEC);

	if (frame % 20 === 0) {
		FPS.text = 'dt: ' + deltaSEC.toFixed(4) + ' | FPS: ' + (myTicker.deltaTime * myTicker.FPS).toFixed(1);
	}

	frame++;
}

// 'Factory'
function newShell(pos: Victor, size: number, vel: Victor) {
	let s = new Shell(pos.x, pos.y, size, vel.x, vel.y, new PIXI.Sprite(PIXI.Loader.shared.resources['missle'].texture), world.getLayer('particles'));
	shells.push(s);
	world.addChild(s.sprite);
	return s;
}
function newPlayer() {
	let p = new Player(0, 0, playerSize);
	world.addChild(p.aim);
	world.addChild(p.cursor);
	return p;
}

// Trash
document.addEventListener('keydown', function (event) {
	if (event.keyCode == 65) { world.camera.position.x -= 5; }//A
	if (event.keyCode == 68) { world.camera.position.x += 5; }//D
	if (event.keyCode == 83) { world.camera.position.y -= 5; }//S
	if (event.keyCode == 87) { world.camera.position.y += 5; }//W
	if (event.keyCode == 69) { world.camera.scale.set(world.camera.scale.x / 1.01, world.camera.scale.y / 1.01); }//E
	else if (event.keyCode == 81) { world.camera.scale.set(world.camera.scale.x * 1.01, world.camera.scale.y * 1.01); }//Q
	if (event.keyCode == 90) { world.camera.angle = 5; } //Z
	else if (event.keyCode == 67) { world.camera.angle -= 5; }//C
});
pixi.stage.on('mousedown', function () { aimPos.copy(mousePos); myPlayer.aiming = true; });
pixi.stage.on('mouseup', function () { myPlayer.aiming = false; });
pixi.stage.on('mousemove', function () { if (myPlayer.aiming) newShell(aimPos, shellSize, aimPos.clone().subtract(mousePos).multiplyScalar(shellVelRatio)); });
