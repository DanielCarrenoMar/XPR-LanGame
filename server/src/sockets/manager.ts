import type { Server, Socket } from "socket.io";
import { createPlayer } from "./handlers/player/newPlayer.js";
import { emitPlayerId } from "./handlers/player/playerId.js";
import { handlePlayerMove } from "./handlers/player/actPlayer.js";
import { handleFire } from "./handlers/bullet/spawnBullet.js";
import { handlePlayerHit } from "./handlers/score/actScore.js";
import type { NewPlayerData, Player } from "./types.js";

let lastPlayerId = 0;

export function registerSocketHandlers(io: Server): void {
	io.on("connection", (socket: Socket) => {
		socket.emit("allplayers", getAllPlayers(io));
		
		socket.on("newplayer", (data: NewPlayerData) => {
			const player = createPlayer(data, getNextPlayerId());
			console.log(`Player connected: ${player.id}`);
			
			socket.data.player = player;
			emitPlayerId(socket, player.id);
			socket.broadcast.emit("newplayer", player);

			socket.on("posPlayer", (moveData) => handlePlayerMove(io, socket, moveData));
			socket.on("fire", (fireData) => handleFire(socket, fireData));
			socket.on("playerHit", (targetId) => handlePlayerHit(io, socket, targetId));
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
		const player = s.data.player as Player | undefined;
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

function handleDisconnect(io: Server, socket: Socket): void {
	const player = socket.data.player as Player | undefined;
	if (!player) return;
	io.emit("remove", player.id);
}
