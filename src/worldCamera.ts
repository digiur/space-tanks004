import * as PIXI from "pixi.js";

class Target extends PIXI.DisplayObject {}
export class WorldCamera {
	private renderer: PIXI.Renderer;
	private worldTranslate: PIXI.Container;
	private worldRotateScale: PIXI.Container;
	private layers: Map<string, PIXI.Container>;
	private pixi: PIXI.Application;
	public camera: Target;
	private currentZ: number;

	constructor(pixi: PIXI.Application, x = 0, y = 0, z = 1, r = 0) {
		this.currentZ = 0;
		this.pixi = pixi;
		this.renderer = pixi.renderer;
		this.worldTranslate = new PIXI.Container();
		this.worldRotateScale = new PIXI.Container();
		this.camera = new Target();
		this.camera.position.x = x;
		this.camera.position.y = y;
		this.camera.angle = r;
		this.camera.scale.set(z, z);
		this.pixi.stage
			.addChild(this.worldTranslate)
			.addChild(this.worldRotateScale);
		this.layers = new Map<string, PIXI.Container>();
		const world = new PIXI.Container();
		world.zIndex = this.currentZ++;
		this.layers.set("world", this.worldRotateScale.addChild(world));
		this.worldRotateScale.sortableChildren = true;
		this.update(0);
	}

	update(dt: number): void {
		this.worldRotateScale.pivot.copyFrom(this.camera.position);
		this.worldRotateScale.position.copyFrom(this.camera.position);
		this.worldRotateScale.scale.x = this.camera.scale.x;
		this.worldRotateScale.scale.y = -this.camera.scale.y;
		this.worldRotateScale.angle = this.camera.angle;
		this.worldTranslate.pivot.x =
			this.camera.position.x - this.renderer.width / 2;
		this.worldTranslate.pivot.y =
			this.camera.position.y - this.renderer.height / 2;
	}

	addChild(child: PIXI.DisplayObject, layerName = "world"): void {
		if (!this.layers.has(layerName)) this.addLayer(layerName);

		(this.layers.get(layerName) as PIXI.Container).addChild(child);
	}

	getLayer(layerName: string): PIXI.Container {
		return this.layers.get(layerName) as PIXI.Container;
	}

	addLayer(layerName: string): void {
		const world = this.layers.get("world") as PIXI.Container;
		const newLayer = new PIXI.Container();
		newLayer.zIndex = this.currentZ++;
		this.layers.set(layerName, world.addChild(newLayer));
	}

	screenToWorld(p: PIXI.Point): PIXI.Point {
		return this.worldRotateScale.localTransform.applyInverse(
			this.worldTranslate.localTransform.applyInverse(p)
		);
	}
}
