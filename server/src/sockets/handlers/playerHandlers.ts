import {
	NewPlayerData,
	Player,
	PlayerHitData,
	PlayerMoveData,
	ServerPlayerData,
} from "#sockets/types.js";
import { Server, Socket } from "socket.io";

export function createPlayer(data: NewPlayerData, id: number, lastError = ""): ServerPlayerData {
	return {
		id,
        name: data.name,
		x: data.x,
		y: data.y,
		angle: 0,
		frontModule: data.frontModule,
		backModule: data.backModule,
		lastError,
		score: 0,
	};
}

export function toPublicPlayer(player: ServerPlayerData): Player {
	return {
		id: player.id,
		name: player.name,
		x: player.x,
		y: player.y,
		angle: player.angle,
		frontModule: player.frontModule,
		backModule: player.backModule,
	};
}

export function handlePlayerDisconnect(io: Server, socket: Socket): void {
	const player = socket.data.player as ServerPlayerData | undefined;
	if (!player) return;
	io.emit("remove", player.id);
}


export function handlePlayerMove(io: Server, socket: Socket, data: PlayerMoveData): void {
	const player = socket.data.player as Player | undefined;
	if (!player) return;

	player.x = data.x;
	player.y = data.y;
	player.angle = data.angle;

	io.emit("move", player);
}

export function handlePlayerHit(io: Server, socket: Socket, targetId: number): void {
	const attacker = socket.data.player as Player | undefined;
	if (!attacker) return;

	io.sockets.sockets.forEach((s) => {
		const player = s.data.player as Player | undefined;
		if (player && player.id === targetId) {
			s.emit("hit", { fromId: attacker.id, targetId } as PlayerHitData);
		}
	});
}

export function handlePlayerError(socket: Socket, errorMessage: unknown): void {
	const player = socket.data.player as ServerPlayerData | undefined;
	if (!player) return;

	const parsedError = typeof errorMessage === "string" ? errorMessage : JSON.stringify(errorMessage);
	player.lastError = parsedError.trim();
}