export type PlayerAdminView = {
    id: number;
    name: string;
    frontModule: string;
    backModule: string;
    status: "OK" | "ERROR";
    lastError: string;
};

export type PlayerLeaderboardItem = {
    id: number;
    name: string;
    score: number;
    frontModule: string;
    backModule: string;
};