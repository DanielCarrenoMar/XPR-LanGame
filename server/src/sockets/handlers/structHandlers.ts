import type { Server, Socket } from "socket.io";
import type { Player, StructHitData, StructLifeMap } from "#sockets/types.js";

const structDamages: StructLifeMap = {};

export function getAllStructLifes(): StructLifeMap {
	return { ...structDamages };
}

export function handleStructHit(socket: Socket, structureId: number): void {
	const player = socket.data.player as Player | undefined;
	if (!player || !Number.isInteger(structureId) || structureId < 0) {
		return;
	}

	const currentDamage = structDamages[structureId] ?? 0;
	const nextDamage = currentDamage + 1;
	structDamages[structureId] = nextDamage;

	socket.broadcast.emit("hitStruct", {
		structureId,
		damage: nextDamage,
	} as StructHitData);
}

export function emitAllStructLifes(io: Server | Socket, socket: Socket): void {
	if ("sockets" in io) {
		socket.emit("allLifeStructs", getAllStructLifes());
		return;
	}

	socket.emit("allLifeStructs", getAllStructLifes());
}
