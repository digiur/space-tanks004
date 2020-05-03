import * as PIXI from 'pixi.js';

export class WorldCamera {
	private renderer: PIXI.Renderer;
	private worldTranslate: PIXI.Container;
	private worldRotateScale: PIXI.Container;
	private layers: Map<string, PIXI.Container>;
	private pixi: PIXI.Application;
	public camera: Target;

	constructor(pixi: PIXI.Application, x: number = 0, y: number = 0, z: number = 1, r: number = 0) {
		this.pixi = pixi;
		this.renderer = pixi.renderer;
		this.worldTranslate = new PIXI.Container;
		this.worldRotateScale = new PIXI.Container;
		this.camera = new Target();
		this.camera.position.x = x;
		this.camera.position.y = y;
		this.camera.angle = r;
		this.camera.scale.set(z, z);
		this.pixi.stage.addChild(this.worldTranslate).addChild(this.worldRotateScale);
		this.layers = new Map<string, PIXI.Container>();
		this.layers.set('world', this.worldRotateScale.addChild(new PIXI.Container));
		this.update(0);
	}

	update(dt: number) {
		this.worldRotateScale.pivot.copyFrom(this.camera.position);
		this.worldRotateScale.position.copyFrom(this.camera.position);
		this.worldRotateScale.scale.x = this.camera.scale.x;
		this.worldRotateScale.scale.y = -this.camera.scale.y;
		this.worldRotateScale.angle = this.camera.angle;
		this.worldTranslate.pivot.x = this.camera.position.x - this.renderer.width / 2;
		this.worldTranslate.pivot.y = this.camera.position.y - this.renderer.height / 2;
	}

	addChild(child: PIXI.DisplayObject, layerName: string = 'world') {

		if (!this.layers.has(layerName))
			this.addLayer(layerName);

		let container = this.layers.get(layerName) as PIXI.Container;
		container.addChild(child);
	}

	getLayer(layerName: string) {
		return this.layers.get(layerName) as PIXI.Container;
	}

	addLayer(layerName: string) {
		// Neat trick from github:tizmagik/getLastInMap.js
		let lastContainer = Array.from(this.layers)[this.layers.size - 1][1] as PIXI.Container;
		this.layers.set(layerName, lastContainer.addChild(new PIXI.Container));
	}

	screenToWorld(p: PIXI.Point) {
		return this.worldRotateScale.localTransform.applyInverse(this.worldTranslate.localTransform.applyInverse(p));
	}
}

class Target extends PIXI.DisplayObject { }