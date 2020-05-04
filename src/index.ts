//import IO from "socket.io-client";
import * as PIXI from "pixi.js";
import { SpaceTanks } from "./SpaceTanks";

// New PIXI Instance
const pixi = new PIXI.Application({
	backgroundColor: 0x000000,
	antialias: true,
	width: window.innerWidth,
	height: window.innerHeight,
});

// New Space Tanks Instance
const SPACE_TANKS = new SpaceTanks(pixi);

// FPS Tools
const ticker = new PIXI.Ticker();
let frame = 0;
const FPS = new PIXI.Text("FPS", {
	fontSize: 16,
	fill: "black",
	stroke: "#ffffff",
	strokeThickness: 1,
});

// "But I knew I needed a click..."
function click(): void {
	frame++;
	const deltaS = ticker.deltaMS / 1000;

	SPACE_TANKS.stUpdate(deltaS);

	if (frame % 20 === 0) {
		FPS.text = `dt: ${deltaS.toFixed(4)} | FPS: ${(
			ticker.deltaTime * ticker.FPS
		).toFixed(2)}`;
	}
}

// In the beginning
function start(): void {
	console.log("starting");
	SPACE_TANKS.stInit();
	pixi.stage.addChild(FPS);
	FPS.position.set(20, 20);
	ticker.minFPS = 30;
	ticker.maxFPS = 60;
	ticker.add(click);
	ticker.start();
}

// Add Pixi to te document
document.body.appendChild(pixi.view);

// Listen for keyboard events
document.addEventListener("keydown", function (event) {
	if (event.keyCode == 65) {
		SPACE_TANKS.worldCamera.camera.position.x -= 150;
	} //A
	if (event.keyCode == 68) {
		SPACE_TANKS.worldCamera.camera.position.x += 150;
	} //D
	if (event.keyCode == 83) {
		SPACE_TANKS.worldCamera.camera.position.y -= 150;
	} //S
	if (event.keyCode == 87) {
		SPACE_TANKS.worldCamera.camera.position.y += 150;
	} //W
	if (event.keyCode == 69) {
		SPACE_TANKS.worldCamera.camera.scale.set(
			SPACE_TANKS.worldCamera.camera.scale.x / 1.02,
			SPACE_TANKS.worldCamera.camera.scale.y / 1.02
		);
	} //E
	else if (event.keyCode == 81) {
		SPACE_TANKS.worldCamera.camera.scale.set(
			SPACE_TANKS.worldCamera.camera.scale.x * 1.02,
			SPACE_TANKS.worldCamera.camera.scale.y * 1.02
		);
	} //Q
	if (event.keyCode == 90) {
		SPACE_TANKS.worldCamera.camera.angle += 5;
	} //Z
	else if (event.keyCode == 67) {
		SPACE_TANKS.worldCamera.camera.angle -= 5;
	} //C
});

// Sign up loader events
PIXI.Loader.shared.onError.add(() => {
	console.log("LOAD ERROR");
});
PIXI.Loader.shared.onLoad.add(() => {
	console.log("File Loaded...");
});
PIXI.Loader.shared.onComplete.add(() => {
	console.log("Load finished!");
});

// Loader
PIXI.Loader.shared
	.add("tankPig", "tankPig3.png")
	.add("fire", "Fire.png")
	.add("missile", "missile.png")
	.add("star", "star.png")
	.add("smoke", "smokeParticle.png")
	.add("whiteSquare25", "Pixel25.png")
	.add("whiteSquare50", "Pixel50.png")
	.add("whiteSquare100", "Pixel100.png")
	.load(start);
