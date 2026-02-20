import { io } from "#src/index.js";
import { Router, type Request, type Response } from "express";
import { getServerPlayers } from "#sockets/manager.js";
import { PlayerAdminView } from "./types.js";
import type { Server } from "socket.io";

const router = Router();

function getPlayersAdminView(io: Server): PlayerAdminView[] {
	return getServerPlayers(io).map((player) => ({
		id: player.id,
		name: player.name,
		frontModule: player.frontModule,
		backModule: player.backModule,
		status: player.lastError.trim().length === 0 ? "OK" : "ERROR",
		lastError: player.lastError,
	}));
}

function getPlayersController(_req: Request, res: Response): void {
	const players = getPlayersAdminView(io);
	const playersWithError = players.filter((player) => player.status === "ERROR").length;

	res.status(200).json({
		ok: true,
		count: players.length,
		playersWithError,
		playersOk: players.length - playersWithError,
		players,
	});
}

router.get("/api/admin/players", getPlayersController);

function getConnectedPlayersCount(io: Server): number {
	return getServerPlayers(io).length;
}

function getPlayerCountController(_req: Request, res: Response): void {
	const count = getConnectedPlayersCount(io);
	res.status(200).json({
		ok: true,
		count,
	});
}

router.get("/api/admin/players/count", getPlayerCountController);

export default router;
