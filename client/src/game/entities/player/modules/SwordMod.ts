import BaseModule from "./BaseModule.ts";

export default class SwordMod extends BaseModule {

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
    }

    fire(playerPos: Phaser.Math.Vector2, targetPos: Phaser.Math.Vector2): void {
    }
}