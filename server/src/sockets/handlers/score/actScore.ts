import type { Server, Socket } from "socket.io";
import type { Player } from "../../types.js";

export function handlePlayerHit(io: Server, socket: Socket, targetId: number): void {
	const attacker = socket.data.player as Player | undefined;
	if (!attacker) return;

	io.sockets.sockets.forEach((s) => {
		const player = s.data.player as Player | undefined;
		if (player && player.id === targetId) {
			s.emit("hit", { fromId: attacker.id, targetId });
		}
	});
}
