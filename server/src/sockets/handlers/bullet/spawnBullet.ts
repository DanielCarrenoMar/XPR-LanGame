import type { Socket } from "socket.io";
import type { FireData, Player } from "../../types.js";

export function handleFire(socket: Socket, data: FireData): void {
	const player = socket.data.player as Player | undefined;
	if (!player) return;

	socket.broadcast.emit("fire", { id: player.id, ...data });
}
