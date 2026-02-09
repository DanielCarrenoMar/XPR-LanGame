import BaseShield from "./BaseShield.ts";

export default class Shield extends BaseShield {
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string = "logo") {
        super(scene, x, y, texture, 64, 64);
    }
}
