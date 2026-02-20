import type { Server, Socket } from "socket.io";
import { handleFire } from "./handlers/bullet/spawnBullet.js";
import type {
	NewPlayerData,
	Player,
	ServerPlayerData,
} from "./types.js";
import {
	createPlayer,
	handlePlayerHit,
	handlePlayerMove,
	toPublicPlayer,
} from "#handlers/playerHandlers.js";
import { getAllStructLifes, handleStructHit } from "#handlers/structHandlers.js";

let lastPlayerId = 0;
const playerLastErrorByName = new Map<string, string>();

export function registerSocketHandlers(io: Server): void {
	io.on("connection", (socket: Socket) => {
		socket.emit("allplayers", getAllPlayers(io));
		socket.emit("allLifeStructs", getAllStructLifes());
		
		socket.on("newplayer", (data: NewPlayerData) => {
			const playerName = data.name.trim();
			if (playerLastErrorByName.has(playerName)) {
				playerLastErrorByName.set(playerName, "");
			}

			const player = createPlayer(
				{ ...data, name: playerName },
				getNextPlayerId(),
				playerLastErrorByName.get(playerName) ?? "",
			);
			console.log(`Player connected: ${player.id}`);
			
			socket.data.player = player;
			applyPlayerValidation(player);
			socket.emit("playerId", player.id);
			socket.broadcast.emit("newplayer", toPublicPlayer(player));

			socket.on("posPlayer", (moveData) => handlePlayerMove(io, socket, moveData));
			socket.on("fire", (fireData) => handleFire(socket, fireData));
			socket.on("playerHit", (targetId) => handlePlayerHit(io, socket, targetId));
			socket.on("hitStruct", (structureId) => handleStructHit(socket, structureId));
			socket.on("disconnect", () => handleDisconnect(io, socket));
		});

		socket.on("test", () => { 
			console.log("test received");
		});
	});
}

function getAllPlayers(io: Server): Player[] {
	const players: Player[] = [];
	io.sockets.sockets.forEach((s) => {
		const player = s.data.player as ServerPlayerData | undefined;
		if (player) players.push(toPublicPlayer(player));
	});
	return players;
}

export function getServerPlayers(io: Server): ServerPlayerData[] {
	const players: ServerPlayerData[] = [];
	io.sockets.sockets.forEach((s) => {
		const player = s.data.player as ServerPlayerData | undefined;
		if (player) players.push(player);
	});
	return players;
}

function applyPlayerValidation(player: ServerPlayerData): void {
	const hasFrontModule = player.frontModule.trim().length > 0;
	const hasBackModule = player.backModule.trim().length > 0;

	if (hasFrontModule && hasBackModule) {
		player.lastError = "";
		playerLastErrorByName.set(player.name, "");
		return;
	}

	const details: string[] = [];
	if (!hasFrontModule) details.push("frontModule vacio");
	if (!hasBackModule) details.push("backModule vacio");

	player.lastError = details.join(", ");
	playerLastErrorByName.set(player.name, player.lastError);
}

export function getConnectedPlayersCount(io: Server): number {
	return getServerPlayers(io).length;
}

export function sendToAllSockets(io: Server | Socket, event: string, data: any): void {
	if ("sockets" in io) {
		io.sockets.sockets.forEach((s) => {
			s.emit(event, data);
		});
		return;
	}
	io.emit(event, data);
	io.broadcast.emit(event, data);
}

function getNextPlayerId(): number {
	const id = lastPlayerId;
	lastPlayerId += 1;
	return id;
}

function handleDisconnect(io: Server, socket: Socket): void {
	const player = socket.data.player as ServerPlayerData | undefined;
	if (!player) return;
	if (player.name.trim().length > 0) {
		playerLastErrorByName.set(player.name, "Jugador desconectado");
	}
	io.emit("remove", player.id);
}
