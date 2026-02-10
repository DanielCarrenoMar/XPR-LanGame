import type { Server, Socket } from "socket.io";
import type { Player, PlayerMoveData } from "../../types.js";

export function handlePlayerMove(io: Server, socket: Socket, data: PlayerMoveData): void {
	const player = socket.data.player as Player | undefined;
	if (!player) return;

	player.x = data.x;
	player.y = data.y;
	player.angle = data.angle;

	io.emit("move", player);
}
