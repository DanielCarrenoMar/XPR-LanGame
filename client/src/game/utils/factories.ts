import { BaseBullet, BulletType } from "#entities/bullet/BaseBullet.ts";
import Bullet from "#entities/bullet/Bullet.ts";
import BaseWeapon from "#player/weapon/BaseWeapon.ts";
import ShotgunWeapon from "#player/weapon/ShotgunWeapon.ts";
import ShieldWeapon from "#player/weapon/ShieldWeapon.ts";
import SwordWeapon from "#player/weapon/SwordWeapon.ts";
import { WeaponType } from "#src/modificable.ts";

export function createBullet(scene: Phaser.Scene, x: number, y: number, angle: number, type: BulletType, ownerId: number | null): BaseBullet {
    switch (type) {
        case "BULLET":
            const bullet = new Bullet(scene, x, y, angle, ownerId);
            return bullet;
        default:
            throw new Error(`Unknown bullet type: ${type}`);
    }
}

export function createWeapon(scene: Phaser.Scene, x: number, y: number, moduleType: WeaponType): BaseWeapon | null {
    switch (moduleType) {
        case "SHOTGUN":
            return new ShotgunWeapon(scene, x, y);
        case "SHIELD":
            return new ShieldWeapon(scene, x, y);
        case "SWORD":
            return new SwordWeapon(scene, x, y);
        case "NONE":
            return null;
        default:
            throw new Error(`Unknown module type: ${moduleType}`);
    }
}