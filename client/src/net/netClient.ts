import { io, Socket } from "socket.io-client";

export type PlayerState = {
    id: number;
    x: number;
    y: number;
};

type ClientHandlers = {
    onAllPlayers?: (players: PlayerState[]) => void;
    onPlayerAdded?: (player: PlayerState) => void;
    onPlayerMoved?: (player: PlayerState) => void;
    onPlayerRemoved?: (playerId: number) => void;
};

class NetClient {
    private socket: Socket | null = null;
    private handlers: ClientHandlers = {};
    private localPlayerId: number | null = null;
    private lastSent: { x: number; y: number } | null = null;
    private lastSentAt = 0;

    connect(): void {
        if (this.socket) {
            return;
        }

        const serverUrl = import.meta.env.VITE_SERVER_URL ?? "https://xpr-langame.onrender.com/";
        this.socket = io(serverUrl);

        this.socket.on("connect", () => {
            this.socket?.emit("newplayer");
        });

        this.socket.on("playerId", (playerId: number) => {
            this.localPlayerId = playerId;
        });

        this.socket.on("allplayers", (players: PlayerState[]) => {
            const filtered = this.filterLocalPlayer(players);
            this.handlers.onAllPlayers?.(filtered);
        });

        this.socket.on("newplayer", (player: PlayerState) => {
            if (this.isLocalPlayer(player.id)) {
                return;
            }
            this.handlers.onPlayerAdded?.(player);
        });

        this.socket.on("move", (player: PlayerState) => {
            if (this.isLocalPlayer(player.id)) {
                return;
            }
            this.handlers.onPlayerMoved?.(player);
        });

        this.socket.on("remove", (playerId: number) => {
            if (this.isLocalPlayer(playerId)) {
                return;
            }
            this.handlers.onPlayerRemoved?.(playerId);
        });
    }

    setHandlers(handlers: ClientHandlers): void {
        this.handlers = handlers;
    }

    sendPlayerPosition(x: number, y: number): void {
        if (!this.socket || !this.socket.connected) {
            return;
        }

        const now = performance.now();
        const minIntervalMs = 50;
        const minDistance = 0.5;

        if (this.lastSent) {
            const dx = x - this.lastSent.x;
            const dy = y - this.lastSent.y;
            const distance = Math.hypot(dx, dy);
            if (distance < minDistance && now - this.lastSentAt < minIntervalMs) {
                return;
            }
        }

        this.lastSent = { x, y };
        this.lastSentAt = now;
        this.socket.emit("posPlayer", { x, y });
    }

    private filterLocalPlayer(players: PlayerState[]): PlayerState[] {
        if (this.localPlayerId === null) {
            return players;
        }
        return players.filter((player) => player.id !== this.localPlayerId);
    }

    private isLocalPlayer(playerId: number): boolean {
        return this.localPlayerId === playerId;
    }
}

export const netClient = new NetClient();
