import BaseBullet from "./BaseBullet.ts";

export default class Bullet extends BaseBullet {
    constructor(scene: Phaser.Scene, x: number, y: number, velocity: Phaser.Math.Vector2) {
        super(scene, x, y, velocity);
    }
}