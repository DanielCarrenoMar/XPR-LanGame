import { getBattleStatus } from "#endpoints/adminState.js";
import type { KillData, ScoreKillData, ServerPlayerData } from "#sockets/types.js";
import type { Server, Socket } from "socket.io";

export function handlePlayerKill(io: Server, socket: Socket, data: KillData): void {
	if (!getBattleStatus().active) {
		return;
	}

	const victim = socket.data.player as ServerPlayerData | undefined;
	if (!victim) {
		return;
	}

	if (!Number.isInteger(data.killerId)) {
		return;
	}

	if (victim.id === data.killerId) {
		return;
	}

	let killer: ServerPlayerData | undefined;
	io.sockets.sockets.forEach((s) => {
		const player = s.data.player as ServerPlayerData | undefined;
		if (player && player.id === data.killerId) {
			killer = player;
		}
	});

	if (!killer) {
		return;
	}

	killer.score += 100;

	const scoreKillData: ScoreKillData = {
		killerName: killer.name,
		targetName: victim.name,
		frontModule: killer.frontModule,
		backModule: killer.backModule,
		score: killer.score,
	};

	io.emit("scoreKill", scoreKillData);
}
