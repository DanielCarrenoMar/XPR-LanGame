import BaseShield from "./BaseShield.ts";

export default class Shield extends BaseShield {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 48, 48);
        this.setVisible(true);
    }
}
