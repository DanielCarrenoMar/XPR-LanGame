export type Player = {
    id: number;
    name: string;
    x: number;
    y: number;
    angle: number;
    frontModule: string;
    backModule: string;
};

export type NewPlayerData = {
    name: string;
    frontModule: string;
    backModule: string;
    x: number;
    y: number;
};

export type PlayerMoveData = {
    x: number;
    y: number;
    angle: number;
};

export type PlayerHitData = {
    fromId: number;
    targetId: number;
};

export type SpawnBulletData = {
    x: number;
    y: number;
    angle: number;
    bulletType: string;
};

export type StructHitData = {
    structureId: number;
    life: number;
};

export type StructLifeMap = Record<number, number>;
