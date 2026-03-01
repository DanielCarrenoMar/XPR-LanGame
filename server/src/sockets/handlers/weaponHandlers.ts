import type { Socket } from "socket.io";
import type { FireData, Player, PlayerFireData } from "../types.js";
import { sendToAllSockets } from "#sockets/manager.js";

export function handleFire(socket: Socket, data: FireData): void {
	const player = socket.data.player as Player | undefined;
	if (!player) return;
	const payload: PlayerFireData = {
		id: player.id,
		targetX: data.targetX,
		targetY: data.targetY,
	};
	sendToAllSockets(socket, "fire", payload);
}
