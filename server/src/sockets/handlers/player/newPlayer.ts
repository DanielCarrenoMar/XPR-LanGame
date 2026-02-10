import type { NewPlayerData, Player } from "../../types.js";

export function createPlayer(data: NewPlayerData, id: number): Player {
	return {
		id,
		x: data.x,
		y: data.y,
		angle: 0,
		frontModule: data.frontModule,
		backModule: data.backModule,
	};
}

