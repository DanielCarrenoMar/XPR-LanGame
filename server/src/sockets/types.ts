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

export type SpawnBulletData = {
    x: number;
    y: number;
    angle: number;
    bulletType: string;
};
