import * as PIXI from "pixi.js";
import * as CMP from "./stComponents";
import * as OBJ from "./stObjects";
import { SpaceTanks } from "./spaceTanks";

export class STFactory {
	private ST: SpaceTanks;
	private pixi: PIXI.Application;
	private tanks: Map<string, OBJ.Tank>;
	constructor(ST: SpaceTanks, pixi: PIXI.Application) {
		this.ST = ST;
		this.pixi = pixi;
		this.tanks = new Map<string, OBJ.Tank>();
	}

	public newTank(): OBJ.Tank {
		console.log("newTank");
		const newTank = new OBJ.Tank();
		const newComponent = this.newSprite("tankPig");
		this.ST.worldCamera.addChild(newComponent.sprite, "tanks");
		newTank.AddComponent(newComponent);
		return newTank;
	}

	private newSprite(textureName: string): CMP.STSprite {
		return new CMP.STSprite(
			textureName,
			new PIXI.Sprite(PIXI.Loader.shared.resources[textureName].texture)
		);
	}
}
