import { NewPlayerData, Player, PlayerMoveData } from "#sockets/types.js";
import { Server, Socket } from "socket.io";

export function createPlayer(data: NewPlayerData, id: number): Player {
	return {
		id,
        name: data.name,
		x: data.x,
		y: data.y,
		angle: 0,
		frontModule: data.frontModule,
		backModule: data.backModule,
	};
}

export function handlePlayerMove(io: Server, socket: Socket, data: PlayerMoveData): void {
	const player = socket.data.player as Player | undefined;
	if (!player) return;

	player.x = data.x;
	player.y = data.y;
	player.angle = data.angle;

	io.emit("move", player);
}