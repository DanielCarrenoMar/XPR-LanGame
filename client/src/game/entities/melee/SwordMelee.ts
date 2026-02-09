import BaseMelee from "./BaseMelee.ts";

export default class SwordMelee extends BaseMelee {

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, "", 180);
        this.setVisible(false);
    }
}