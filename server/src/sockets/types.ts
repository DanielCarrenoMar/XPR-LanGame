export type Player = {
    id: number;
    x: number;
    y: number;
    angle: number;
    frontModule: string;
    backModule: string;
};

export type NewPlayerData = {
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

export type FireData = {
    x: number;
    y: number;
    angle: number;
};
