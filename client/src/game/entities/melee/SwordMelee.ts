import BaseMelee from "./BaseMelee.ts";

export default class SwordMelee extends BaseMelee {

    constructor(scene: Phaser.Scene, x: number, y: number, ownerId: number = -1) {
        super(scene, x, y, "", ownerId, 180);
        const body = this.body as Phaser.Physics.Arcade.StaticBody;
        body.setSize(64, 64);
        this.setVisible(false);
    }
}