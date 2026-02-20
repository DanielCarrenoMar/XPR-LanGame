import { Router, type Request, type Response } from "express";
import { getBattleStatus, toggleBattle } from "#endpoints/adminState.js";
import { io } from "src/index.js";

const router = Router();

function getBattleController(_req: Request, res: Response): void {
	res.status(200).json({
		ok: true,
		battle: getBattleStatus(),
	});
}

router.get("/api/admin/battle", getBattleController);

function toggleBattleController(_req: Request, res: Response): void {
	const battle = toggleBattle();
	io.emit("battleMode", battle.active);
	res.status(200).json({
		ok: true,
		battle,
	});
}

router.post("/api/admin/battle/toggle", toggleBattleController);

export default router;
