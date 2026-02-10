import type { Socket } from "socket.io";

export function emitPlayerId(socket: Socket, playerId: number): void {
	socket.emit("playerId", playerId);
}
