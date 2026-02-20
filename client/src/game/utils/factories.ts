import { BaseBullet, BulletType } from "#entities/bullet/BaseBullet.ts";
import Bullet from "#entities/bullet/Bullet.ts";
import BaseWeapon from "#player/weapon/BaseWeapon.ts";
import ShotgunWeapon from "#player/weapon/ShotgunWeapon.ts";
import ShieldWeapon from "#player/weapon/ShieldWeapon.ts";
import SwordWeapon from "#player/weapon/SwordWeapon.ts";
import { WeaponType } from "#src/modificable.ts";
import Bush from "#entities/structs/Bush.ts";
import { Struct, StructType } from "#entities/structs/Struct.ts";
import Wall from "#entities/structs/Wall.ts";

export function createStruct(scene: Phaser.Scene, x: number, y: number, width: number, height: number, type: StructType): Struct {
    switch (type) {
        case 'BRUSH':
            return new Bush(scene, x, y, width, height);
        case 'WALL':
            return new Wall(scene, x, y, width, height);
        default:
            throw new Error(`Unknown struct type: ${type}`);
    }
}

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