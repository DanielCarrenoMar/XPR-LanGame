import { io } from "#src/index.js";
import { Router, type Request, type Response } from "express";
import { Server } from "socket.io";
import { getServerPlayers } from "src/sockets/manager.js";
import { PlayerLeaderboardItem } from "./types.js";

const router = Router();

export function getLeaderboardMock(io: Server): PlayerLeaderboardItem[] {
	return getServerPlayers(io)
		.map((player) => ({
			id: player.id,
			name: player.name,
			score: 100 + player.id * 15,
			frontModule: player.frontModule,
			backModule: player.backModule,
		}))
		.sort((a, b) => b.score - a.score);
}

function getLeaderboardController(_req: Request, res: Response): void {
	const leaderboard = getLeaderboardMock(io);
	res.status(200).json({
		ok: true,
		count: leaderboard.length,
		leaderboard,
		source: "mock",
	});
}

router.get("/api/admin/leaderboard", getLeaderboardController);

export default router;
