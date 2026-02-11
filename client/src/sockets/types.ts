import { BulletType } from "#entities/bullet/BaseBullet.ts";
import { WeaponType } from "#src/modificable.ts";

export type PlayerState = {
    id: number;
    x: number;
    y: number;
    angle: number;
    frontModule: WeaponType;
    backModule: WeaponType;
};

export type SpawnBulletData = {
    id: number;
    x: number;
    y: number;
    angle: number;
    bulletType: BulletType;
};
