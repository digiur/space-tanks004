import * as PIXI from "pixi.js";

export class Main {
    private static readonly GAME_WIDTH = 800;
    private static readonly GAME_HEIGHT = 600;

    private app: PIXI.Application | undefined;

    constructor() {
        window.onload = (): void => {
            this.createRenderer();
            const stage = this.app!.stage;

            let circle = new PIXI.Graphics();
            circle.beginFill(0x9966FF);
            circle.drawCircle(0, 0, 32);
            circle.endFill();
            circle.x = 64;
            circle.y = 130;

            this.app!.stage.addChild(circle);
        };
    }

    private createRenderer(): void {
        this.app = new PIXI.Application({
            backgroundColor: 0xd3d3d3,
            width: Main.GAME_WIDTH,
            height: Main.GAME_HEIGHT,
        });

        document.body.appendChild(this.app.view);

        this.app.renderer.resize(window.innerWidth, window.innerHeight);
        this.app.stage.scale.x = window.innerWidth / Main.GAME_WIDTH;
        this.app.stage.scale.y = window.innerHeight / Main.GAME_HEIGHT;

        window.addEventListener("resize", this.onResize.bind(this));
    }

    private onResize(): void {
        if (!this.app) {
            return;
        }

        this.app.renderer.resize(window.innerWidth, window.innerHeight);
        this.app.stage.scale.x = window.innerWidth / Main.GAME_WIDTH;
        this.app.stage.scale.y = window.innerHeight / Main.GAME_HEIGHT;
    }

    // add for the test example purpose
    public helloWorld(): string {
        return "hello world";
    }
}

new Main();
