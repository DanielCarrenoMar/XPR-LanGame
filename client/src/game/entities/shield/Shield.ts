import BaseShield from "./BaseShield.ts";

export default class Shield extends BaseShield {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, "", 64, 64);
        this.setVisible(false);
    }
}
