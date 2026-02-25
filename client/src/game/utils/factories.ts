import { BaseProyectil, ProyectilType } from "#entities/proyectil/BaseProyectil.ts";
import Bullet from "#entities/proyectil/Bullet.ts";
import Grenade from "#entities/proyectil/Grenade.ts";
import Jojo from "#entities/proyectil/Jojo.ts";
import type { BasePlayer } from "#player/BasePlayer.ts";
import BaseWeapon from "#player/weapon/BaseWeapon.ts";
import GrenadeWeapon from "#player/weapon/GrenadeWeapon.ts";
import JojoWeapon from "#player/weapon/JojoWeapon.ts";
import PropulsorWeapon from "#player/weapon/PropulsorWeapon.ts";
import ShotgunWeapon from "#player/weapon/ShotgunWeapon.ts";
import ShieldWeapon from "#player/weapon/ShieldWeapon.ts";
import SwordWeapon from "#player/weapon/SwordWeapon.ts";
import { WeaponType } from "#src/modificable.ts";
import Bush from "#entities/structs/Bush.ts";
import { Struct, StructType } from "#entities/structs/Struct.ts";
import Wall from "#entities/structs/Wall.ts";
import Target from "#entities/structs/Target.ts";

export function createStruct(scene: Phaser.Scene, x: number, y: number, width: number, height: number, type: StructType): Struct {
    switch (type) {
        case 'BRUSH':
            return new Bush(scene, x, y, width, height);
        case 'WALL':
            return new Wall(scene, x, y, width, height);
        case 'TARGET':
            return new Target(scene, x, y, width, height);
        default:
            throw new Error(`Unknown struct type: ${type}`);
    }
}

export function createProyectil(scene: Phaser.Scene, x: number, y: number, angle: number, type: ProyectilType, ownerId: number | null): BaseProyectil {
    switch (type) {
        case "BULLET":
            const bullet = new Bullet(scene, x, y, angle, ownerId);
            return bullet;
        case "GRENADE":
            return new Grenade(scene, x, y, angle, ownerId);
        case "JOJO":
            return new Jojo(scene, x, y, ownerId);
        default:
            throw new Error(`Unknown proyectil type: ${type}`);
    }
}

export function createWeapon(scene: Phaser.Scene, x: number, y: number, moduleType: WeaponType, player: BasePlayer): BaseWeapon | null {
    switch (moduleType) {
        case "GRENADE":
            return new GrenadeWeapon(scene, x, y, player);
        case "SHOTGUN":
            return new ShotgunWeapon(scene, x, y, player);
        case "SHIELD":
            return new ShieldWeapon(scene, x, y, player);
        case "SWORD":
            return new SwordWeapon(scene, x, y, player);
        case "JOJO":
            return new JojoWeapon(scene, x, y, player);
        case "PROPULSOR":
            return new PropulsorWeapon(scene, x, y, player);
        case "NONE":
            return null;
        default:
            throw new Error(`Unknown module type: ${moduleType}`);
    }
}