import type { Server, Socket } from "socket.io";
import type { Player, StructHitData, StructLifeMap } from "#sockets/types.js";

const DEFAULT_STRUCT_LIFE = 5;
const structLifes: StructLifeMap = {};

export function getAllStructLifes(): StructLifeMap {
	return { ...structLifes };
}

export function handleStructHit(socket: Socket, structureId: number): void {
	const player = socket.data.player as Player | undefined;
	if (!player || !Number.isInteger(structureId) || structureId < 0) {
		return;
	}

	const currentLife = structLifes[structureId] ?? DEFAULT_STRUCT_LIFE;
	const nextLife = Math.max(0, currentLife - 1);
	structLifes[structureId] = nextLife;

	socket.broadcast.emit("hitStruct", {
		structureId,
		life: nextLife,
	} as StructHitData);
}

export function emitAllStructLifes(io: Server | Socket, socket: Socket): void {
	if ("sockets" in io) {
		socket.emit("allLifeStructs", getAllStructLifes());
		return;
	}

	socket.emit("allLifeStructs", getAllStructLifes());
}
