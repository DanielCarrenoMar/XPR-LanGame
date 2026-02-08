import { BulletType } from "#entities/bullet/BaseBullet.ts";
import Bullet from "#entities/bullet/Bullet.ts";

export function createBullet(scene: Phaser.Scene, x: number, y: number, angle: number, type: BulletType): BaseBullet {
    switch (type) {
        case "BULLET":
            return new Bullet(scene, x, y, angle);
        default:
            throw new Error(`Unknown bullet type: ${type}`);
    }
}