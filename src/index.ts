
// app.ticker.add(delta => gameLoop(delta));

// function gameLoop(delta){
//     circle.x += 1*delta;
// }

import * as PIXI from 'pixi.js';
import * as VEC from 'ts-vector';
import * as MATH from 'mathjs';
import IO from 'socket.io-client';
import { Planet } from './planet';
import { Shell } from './shell';
import { Trail } from './trail';

let planetMin = 40,
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
	timeSinceRevealed = 0,
	playerSize = 5,
	playerLife = 2000,
	camX = 0,
	camY = 0,
	camZ = 1,
	planets = [] as Planet[],
	shells = [],
	trails = [],
	soc = IO.connect(process.env.PORT ? 'https://space-tanks.herokuapp.com/' + process.env.PORT : 'http://localhost:3033');

setup();

function setup() {
	//Create a Pixi Application
	let app = new PIXI.Application({ backgroundColor: 0x000000, antialias: true, width: window.innerWidth, height: window.innerHeight });
	//Add the canvas that Pixi automatically created for you to the HTML document
	document.body.appendChild(app.view);

	let circle = new PIXI.Graphics();
	circle.beginFill(0x9966FF);
	circle.drawCircle(0, 0, 32);
	circle.endFill();
	circle.x = 64;
	circle.y = 130;
	
	app.stage.addChild(circle);

	const config = {
		epsilon: 1e-12,
		matrix: 'Matrix',
		number: 'number',
		precision: 64,
		predictable: false,
		randomSeed: ""
	};

	const math = MATH.create(MATH.all, config as MATH.ConfigOptions);

	// Generate planets
	let packingWidth = window.innerWidth / 2;
	let packingHeight = window.innerHeight / 2;
	do {
		let p = new Planet(
			new VEC.Vector(MATH.random(-packingWidth, packingWidth), MATH.random(-packingHeight, packingHeight)),
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

		if (save)
			planets.push(p);

	} while (planets.length < planetCount)

	// Connect to server
	//socket = io.connect('http://localhost:3033');

	soc.on('newShell', function (shellData:Shell) {
		shells.push(new Shell(shellData.pos, shellData.vel, shellData.size));
	})

	soc.on('playerPosUpdate', function (pos:VEC.Vector) {
		newTrail(pos, playerSize, playerLife);
	})
}

function newTrail(pos: VEC.Vector, size: number, life: number) {
	trails.push(new Trail(pos, size, life));
}



// function update() {

//   // Update shells and trails and add new trails
//   for (let i = 0; i < shells.length; i++) {
//     newTrail(shells[i].pos.x, shells[i].pos.y, shellSize, trailLife);

//     shells[i].update(planets);
//   }
//   for (let i = 0; i < trails.length; i++)
//     trails[i].update();

//   // Remove dead things
//   let i = 0;
//   while (i < shells.length) {
//     if (shells[i].dead) {
//       newTrail(shells[i].pos.x, shells[i].pos.y, explodeSize, explodeLife);
//       shells.splice(i, 1);
//       continue;
//     }
//     i++
//   }
//   i = 0;
//   while (i < trails.length) {
//     if (trails[i].dead) {
//       trails.splice(i, 1);
//       continue;
//     }
//     i++
//   }

//   // Marco!
//   if ((timeSinceRevealed += deltaTime) > revealedTime) {
//     timeSinceRevealed = 0.0;
//     var x = camMX(mouseX);
//     var y = camMY(mouseY);
//     var playerPosData = {
//       px: x,
//       py: y
//     }
//     socket.emit('playerPosUpdate', playerPosData);
//   }

//   if (keyIsDown(87))//w
//     camY -= 30;
//   if (keyIsDown(65))//a
//     camX -= 30;
//   if (keyIsDown(83))//s
//     camY += 30;
//   if (keyIsDown(68))//d
//     camX += 30;
//   if (keyIsDown(DOWN_ARROW)) {//down
//     camZ /= 1.01;
//   }
//   if (keyIsDown(UP_ARROW)) {//up
//     camZ *= 1.01;
//   }
// }

// function draw() {

//   // Why no game loop?
//   update();

//   // Polo!
//   if (timeSinceRevealed == 0.0)
//     newTrail(camMX(mouseX), camMY(mouseY), playerSize, playerLife);

//   // The background and planets and shells and trails and 'UI' oh my!
//   background(0);
//   for (i = 0; i < planets.length; i++)
//     planets[i].draw();
//   for (i = 0; i < shells.length; i++)
//     shells[i].draw();
//   for (i = 0; i < trails.length; i++)
//     trails[i].draw();
// }

// function touchStarted() {
//   return inputStart()
// }

// function mousePressed() {
//   return inputStart()
// }

// function touchMoved() {
//   return inputMove()
// }

// function mouseDragged() {
//   return inputMove()
// }

// function inputStart() {
//   aimPos.set(camMX(mouseX), camMY(mouseY));
//   return false;
// }

// function inputMove() {
//   let pos = createVector(camMX(mouseX), camMY(mouseY));
//   let vel = p5.Vector.mult(p5.Vector.sub(aimPos, pos), shellVelRatio);
//   newShell(aimPos.x, aimPos.y, vel.x, vel.y, shellSize);
//   return false;
// }

// function newTrail(posX, posY, mySize, myLife) {
//   trails.push(new Trail(posX, posY, mySize, myLife));
// }

// function newShell(posX, posY, velX, velY, size) {
//   shells.push(new Shell(posX, posY, velX, velY, size));
//   var shellData = {
//     px: posX,
//     py: posY,
//     vx: velX,
//     vy: velY,
//     s: size
//   }
//   socket.emit('newShell', shellData);
// }

// function camTX(x) {
//   return (x - camX + windowWidth / 2) / camZ;
// }

// function camTY(y) {
//   return (y - camY + windowHeight / 2) / camZ;
// }

// function camMX(x) {
//   return camX + x * camZ - windowWidth / 2;
// }

// function camMY(y) {
//   return camY + y * camZ - windowHeight / 2;
// }

// function camSZ(s) {
//   return s / camZ;
// }

// function reset() { }


// export class Main {
//     private static readonly GAME_WIDTH = 800;
//     private static readonly GAME_HEIGHT = 600;

//     private app: PIXI.Application | undefined;

//     constructor() {
//         window.onload = (): void => {
//             this.createRenderer();
//             const stage = this.app!.stage;

//             let circle = new PIXI.Graphics();
//             circle.beginFill(0x9966FF);
//             circle.drawCircle(0, 0, 32);
//             circle.endFill();
//             circle.x = 64;
//             circle.y = 130;

//             this.app!.stage.addChild(circle);
//         };
//     }

//     private createRenderer(): void {
//         this.app = new PIXI.Application({
//             backgroundColor: 0xd3d3d3,
//             width: Main.GAME_WIDTH,
//             height: Main.GAME_HEIGHT,
//         });

//         document.body.appendChild(this.app.view);

//         this.app.renderer.resize(window.innerWidth, window.innerHeight);
//         this.app.stage.scale.x = window.innerWidth / Main.GAME_WIDTH;
//         this.app.stage.scale.y = window.innerHeight / Main.GAME_HEIGHT;

//         window.addEventListener("resize", this.onResize.bind(this));
//     }

//     private onResize(): void {
//         if (!this.app) {
//             return;
//         }

//         
//         this.app.stage.scale.x = window.innerWidth / Main.GAME_WIDTH;
//         this.app.stage.scale.y = window.innerHeight / Main.GAME_HEIGHT;
//     }

//     // add for the test example purpose
//     public helloWorld(): string {
//         return "hello world";
//     }
// }

// new Main();
