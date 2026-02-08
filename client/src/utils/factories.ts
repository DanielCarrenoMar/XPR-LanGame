import Bullet from "#entities/bullet/Bullet.ts";

export function createBullet(scene: Phaser.Scene, x: number, y: number, velocity: Phaser.Math.Vector2, type: BulletType): BaseBullet {
    switch (type) {
        case "BULLET":
            return new Bullet(scene, x, y, velocity);
        default:
            throw new Error(`Unknown bullet type: ${type}`);
    }
}