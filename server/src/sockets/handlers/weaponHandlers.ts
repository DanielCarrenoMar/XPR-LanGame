import type { Socket } from "socket.io";
import type { SpawnBulletData, Player } from "../types.js";
import { sendToAllSockets } from "#sockets/manager.js";

export function handleFire(socket: Socket, data: SpawnBulletData): void {
	const player = socket.data.player as Player | undefined;
	if (!player) return;
	sendToAllSockets(socket, "spawnBullet", { id: player.id, ...data });
}
