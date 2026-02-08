import { netClient } from "#net/netClient.ts";
import { createBullet } from "#utils/factories.ts";
import BaseWeapon from "./BaseWeapon.ts";

export default class ShotgunWeapon extends BaseWeapon {

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
    }

    fire(playerPos: Phaser.Math.Vector2, targetPos: Phaser.Math.Vector2): void {
        const angle = Phaser.Math.Angle.Between(playerPos.x, playerPos.y, targetPos.x, targetPos.y);
        const spread = 0.2;
        const angles = [angle - spread, angle, angle + spread];

        angles.forEach((a) => {
            createBullet(this.scene, this.x, this.y, a, "BULLET");
            netClient.sendFire(this.x, this.y, a);
        });
    }
}