import * as PIXI from "pixi.js";
import * as OBJ from "./stObjects";
import * as MATH from "mathjs";
import Victor from "victor";
import { STFactory } from "./stFactory";
import { Shell } from "./shell";
import { WorldCamera } from "./worldCamera";
import { Planet } from "./planet";
import { Player } from "./player";

export class SpaceTanks {
	public pixi: PIXI.Application;
	public factory: STFactory;
	public worldCamera: WorldCamera;
	public myPlayer: Player | undefined;
	public tank: OBJ.Tank | undefined;
	shells = [] as Shell[];
	planets = [] as Planet[];
	aimPos = new Victor(0, 0);
	mousePos = new Victor(0, 0);
	playerSize = 100;
	shellSize = 5;
	planetMin = 500;
	planetMax = 3000;
	planetCount = 20;
	planetBuffer = 2000;
	shellVelRatio = 1;

	constructor(pixi: PIXI.Application) {
		this.pixi = pixi;
		this.factory = new STFactory(this, pixi);
		this.worldCamera = new WorldCamera(pixi);
	}
	stInit(): void {
		// PIXI and world setup for game
		this.pixi.stage.interactive = true;
		this.pixi.stage.hitArea = new PIXI.Rectangle(
			0,
			0,
			window.innerWidth,
			window.innerHeight
		);
		this.worldCamera.addLayer("particle-2");
		this.worldCamera.addLayer("particle-1");
		this.worldCamera.addLayer("particle-0");
		this.worldCamera.addLayer("planets");
		this.worldCamera.addLayer("tanks");
		this.worldCamera.addLayer("shells");
		this.worldCamera.camera.scale.set(0.05, 0.05);

		// Generate Game things
		this.generatePlanets();
		this.tank = this.factory.newTank();
		this.myPlayer = this.newPlayer();

		// Mouse Listeners
		this.pixi.stage.on("mousedown", () => {
			this.aimPos.copy(this.mousePos);
			this.myPlayer?.setAiming();
		});
		this.pixi.stage.on("mousemove", () => {
			if (this.myPlayer?.aiming) 0;
		});
		this.pixi.stage.on("mouseup", () => {
			this.myPlayer?.setNotAiming();
			const dir = this.aimPos
				.clone()
				.subtract(this.mousePos)
				.multiplyScalar(this.shellVelRatio);
			this.newShell(this.aimPos, this.shellSize, dir.rotateDeg(-8), 6);
			this.newShell(this.aimPos, this.shellSize, dir.rotateDeg(2), 6.1);
			this.newShell(this.aimPos, this.shellSize, dir.rotateDeg(2), 6.2);
			this.newShell(this.aimPos, this.shellSize, dir.rotateDeg(2), 6.3);
			this.newShell(this.aimPos, this.shellSize, dir.rotateDeg(2), 6.4);
			this.newShell(this.aimPos, this.shellSize, dir.rotateDeg(2), 6.5);
			this.newShell(this.aimPos, this.shellSize, dir.rotateDeg(2), 6.6);
			this.newShell(this.aimPos, this.shellSize, dir.rotateDeg(2), 6.7);
			this.newShell(this.aimPos, this.shellSize, dir.rotateDeg(2), 6.8);
		});

		console.log("SpaceTanks stIinit over");
	}
	// Main update loop
	stUpdate(dt: number): void {
		const deltaSEC = dt;
		let p = new PIXI.Point(
			this.pixi.renderer.plugins.interaction.mouse.global.x,
			this.pixi.renderer.plugins.interaction.mouse.global.y
		);
		p = this.worldCamera.screenToWorld(p);
		this.mousePos.x = p.x;
		this.mousePos.y = p.y;

		for (let i = 0; i < this.shells.length; i++)
			this.shells[i].stUpdate(this.planets, deltaSEC);

		this.myPlayer?.stUpdate(deltaSEC, this.mousePos);

		let i = 0;
		while (i < this.shells.length) {
			if (this.shells[i].readyForDelete) {
				this.shells[i].sprite.destroy();
				this.shells[i].exhaust.destroy();
				this.shells[i].stars.destroy();
				this.shells.splice(i, 1);
				continue;
			}
			i++;
		}
		i = 0;
		this.worldCamera.update(deltaSEC);
		this.tank?.stUpdate(deltaSEC);
	}
	// 'Factory'
	private newShell(
		pos: Victor,
		size: number,
		vel: Victor,
		life: number
	): Shell {
		const s = new Shell(
			pos.x,
			pos.y,
			size,
			vel.x,
			vel.y,
			new PIXI.Sprite(PIXI.Loader.shared.resources["missile"].texture),
			this.worldCamera,
			life
		);
		this.shells.push(s);
		this.worldCamera.addChild(s.sprite, "shells");
		return s;
	}
	private newPlayer(): Player {
		const p = new Player(0, 0, this.playerSize);
		this.worldCamera.addChild(p.aim);
		this.worldCamera.addChild(p.cursor);
		return p;
	}
	map(
		x: number,
		inMin: number,
		inMax: number,
		outMin: number,
		outMax: number
	): number {
		return ((x - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
	}
	generatePlanets(): void {
		// Generate planets
		console.log("Generate planets");
		MATH.create(MATH.all, { randomSeed: "ichor" });
		const p = new Planet(0, 0, this.planetMax, 1);
		this.planets.push(p);
		this.worldCamera.addChild(p.gfx, "planets");
		const rect = new PIXI.Rectangle();
		let rejections = 0;
		do {
			// Wow, a do while loop in the wild...
			const size = MATH.random(this.planetMin, this.planetMax);
			const p = new Planet(
				MATH.random(
					-this.planetBuffer * this.planetCount,
					this.planetBuffer * this.planetCount
				),
				MATH.random(
					-this.planetBuffer * this.planetCount,
					this.planetBuffer * this.planetCount
				),
				size,
				this.map(size, this.planetMin, this.planetMax, 2, 1)
			);
			let save = true;
			// Only save the planet if it's within the bounding box
			if (!rect.contains(p.pos.x, p.pos.y)) {
				rejections++;
				save = false;
			}
			// Only save the new planet if it is suitably far from existing planets
			for (let i = 0; i < this.planets.length; i++) {
				if (
					p.pos.clone().subtract(this.planets[i].pos).magnitude() <
					this.planets[i].size + p.size + this.planetBuffer
				) {
					rejections++;
					save = false;
				}
			}
			// Ease the rules
			if (rejections >= 100) rect.pad(this.planetMin);
			// Save the Planet?
			if (save) {
				console.log(`!New Planet(${p.pos.x},${p.pos.y})!`);
				this.planets.push(p);
				this.worldCamera.addChild(p.gfx, "planets");
			}
		} while (this.planets.length < this.planetCount - 1);
		// Show world border
		rect.pad(this.planetMax);
		const worldBorder = new PIXI.Graphics();
		worldBorder.lineStyle(100, 0xff0000);
		rect.x = -rect.width / 2;
		rect.y = -rect.height / 2;
		worldBorder.moveTo(rect.left, rect.top);
		worldBorder.lineTo(rect.left, rect.bottom);
		worldBorder.lineTo(rect.right, rect.bottom);
		worldBorder.lineTo(rect.right, rect.top);
		worldBorder.lineTo(rect.left, rect.top);
		this.worldCamera.addChild(worldBorder);
	}
}
