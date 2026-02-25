import { ProyectilType } from "#entities/proyectil/BaseProyectil.ts";
import { WeaponType } from "#src/modificable.ts";

export type PlayerState = {
    id: number;
    name: string;
    x: number;
    y: number;
    angle: number;
    frontModule: WeaponType;
    backModule: WeaponType;
};

export type NewPlayerData = {
    name: string;
    frontModule: WeaponType;
    backModule: WeaponType;
    x: number;
    y: number;
}

export type PlayerHitData = {
	fromId: number;
	targetId: number;
}

export type SpawnBulletData = {
    id: number;
    x: number;
    y: number;
    angle: number;
    bulletType: ProyectilType;
};

export type StructHitData = {
    structureId: number;
    damage: number;
};

export type StructLifeMap = Record<number, number>;

export type KillData = {
    killerId: number;
};

export type ScoreKillData = {
    killerName: string;
    targetName: string;
    frontModule: WeaponType;
    backModule: WeaponType;
    score: number;
};
