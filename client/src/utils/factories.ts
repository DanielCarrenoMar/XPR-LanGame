import { BaseBullet, BulletType } from "#entities/bullet/BaseBullet.ts";
import Bullet from "#entities/bullet/Bullet.ts";
import BaseWeapon from "#player/weapon/BaseWeapon.ts";
import ShotgunWeapon from "#player/weapon/ShotgunWeapon.ts";
import { WeaponType } from "#src/modificable.ts";

export function createBullet(scene: Phaser.Scene, x: number, y: number, angle: number, type: BulletType): BaseBullet {
    switch (type) {
        case "BULLET":
            return new Bullet(scene, x, y, angle);
        default:
            throw new Error(`Unknown bullet type: ${type}`);
    }
}

export function createWeapon(scene: Phaser.Scene, x: number, y: number, moduleType: WeaponType): BaseWeapon | null {
    switch (moduleType) {
        case "SHOTGUN":
            return new ShotgunWeapon(scene, x, y);
        case "NONE":
            return null;
        default:
            throw new Error(`Unknown module type: ${moduleType}`);
    }
}