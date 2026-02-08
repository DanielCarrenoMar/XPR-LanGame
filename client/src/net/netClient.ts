import { io, Socket } from "socket.io-client";
import { Modificable, WeaponType } from "#src/modificable.ts";

export type PlayerState = {
    id: number;
    x: number;
    y: number;
    angle: number;
    frontModule: WeaponType;
    backModule: WeaponType;
};


type ClientHandlers = {
    onAllPlayers?: (players: PlayerState[]) => void;
    onPlayerAdded?: (player: PlayerState) => void;
    onPlayerMoved?: (player: PlayerState) => void;
    onPlayerRemoved?: (playerId: number) => void;
    onPlayerShoot?: (data: { id: number; x: number; y: number; angle: number }) => void;
    onLocalPlayerId?: (playerId: number) => void;
};

class NetClient {
    private socket: Socket | null = null;
    private handlers: ClientHandlers = {};
    private localPlayerId: number | null = null;
    private lastSent: { x: number; y: number; angle: number } | null = null;
    private lastSentAt = 0;

    connect(): void {
        if (this.socket) {
            return;
        }

        //const serverUrl = "https://xpr-langame.onrender.com/";
        const serverUrl = "http://localhost:8081";
        this.socket = io(serverUrl);

        this.socket.on("connect", () => {
            this.socket?.emit("newplayer", {
                frontModule: Modificable.frontModule,
                backModule: Modificable.backModule
            });
        });

        this.socket.on("playerId", (playerId: number) => {
            this.localPlayerId = playerId;
            this.handlers.onLocalPlayerId?.(playerId);
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

        this.socket.on("fire", (data: { id: number; x: number; y: number; angle: number }) => {
            if (this.isLocalPlayer(data.id)) {
                return;
            }
            this.handlers.onPlayerShoot?.(data);
        });
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    setHandlers(handlers: ClientHandlers): void {
        this.handlers = handlers;
    }

    sendPlayerPosition(x: number, y: number, angle: number): void {
        if (!this.socket || !this.socket.connected) {
            return;
        }

        const now = performance.now();
        const minIntervalMs = 50;
        const minDistance = 0.5;
        const minAngle = 0.05; // radians

        if (this.lastSent) {
            const dx = x - this.lastSent.x;
            const dy = y - this.lastSent.y;
            const distance = Math.hypot(dx, dy);
            const dAngle = Math.abs(angle - this.lastSent.angle);
            
            if (distance < minDistance && dAngle < minAngle && now - this.lastSentAt < minIntervalMs) {
                return;
            }
        }

        this.lastSent = { x, y, angle };
        this.lastSentAt = now;
        this.socket.emit("posPlayer", { x, y, angle });
    }

    sendFire(x: number, y: number, angle: number): void {
        if (!this.socket || !this.socket.connected) return;
        this.socket.emit("fire", { x, y, angle });
    }

    sendPlayerHit(targetId: number): void {
        if (!this.socket || !this.socket.connected) return;
        this.socket.emit("playerHit", targetId);
    }

    getLocalPlayerId(): number | null {
        return this.localPlayerId;
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
