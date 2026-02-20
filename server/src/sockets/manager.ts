import type { Server, Socket } from "socket.io";
import { handleFire } from "./handlers/weaponHandlers.js";
import type {
	NewPlayerData,
	Player,
	ServerPlayerData,
} from "./types.js";
import {
	createPlayer,
	handlePlayerDisconnect,
	handlePlayerError,
	handlePlayerHit,
	handlePlayerMove,
	toPublicPlayer,
} from "#handlers/playerHandlers.js";
import { getAllStructLifes, handleStructHit } from "#handlers/structHandlers.js";

let lastPlayerId = 0;

export function registerSocketHandlers(io: Server): void {
	io.on("connection", (socket: Socket) => {
		socket.emit("allplayers", getAllPlayers(io));
		socket.emit("allLifeStructs", getAllStructLifes());
		
		socket.on("newplayer", (data: NewPlayerData) => {
			const playerName = data.name.trim();

			const player = createPlayer(
				{ ...data, name: playerName },
				getNextPlayerId(),
			);
			console.log(`Player connected: ${player.id}`);
			
			socket.data.player = player;
			socket.emit("playerId", player.id);
			socket.broadcast.emit("newplayer", toPublicPlayer(player));

			socket.on("posPlayer", (moveData) => handlePlayerMove(io, socket, moveData));
			socket.on("fire", (fireData) => handleFire(socket, fireData));
			socket.on("playerHit", (targetId) => handlePlayerHit(io, socket, targetId));
			socket.on("hitStruct", (structureId) => handleStructHit(socket, structureId));
			socket.on("error", (errorMessage: unknown) => handlePlayerError(socket, errorMessage));
			socket.on("disconnect", () => handlePlayerDisconnect(io, socket));
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

