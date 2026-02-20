export type BattleStatus = {
	active: boolean;
	startedAt: number | null;
	elapsedMs: number;
};

let isBattleActive = false;
let battleStartedAt: number | null = null;

export function getBattleStatus(): BattleStatus {
	return {
		active: isBattleActive,
		startedAt: battleStartedAt,
		elapsedMs: isBattleActive && battleStartedAt !== null ? Date.now() - battleStartedAt : 0,
	};
}

export function startBattle(): BattleStatus {
	if (!isBattleActive) {
		isBattleActive = true;
		battleStartedAt = Date.now();
	}
	return getBattleStatus();
}

export function stopBattle(): BattleStatus {
	isBattleActive = false;
	battleStartedAt = null;
	return getBattleStatus();
}

export function toggleBattle(): BattleStatus {
	if (isBattleActive) {
		return stopBattle();
	}
	return startBattle();
}
