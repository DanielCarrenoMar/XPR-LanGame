import BaseWeapon from "./BaseWeapon.ts";

export default class ShieldWeapon extends BaseWeapon {

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
    }

    fire(playerPos: Phaser.Math.Vector2, targetPos: Phaser.Math.Vector2): void {
    }
}