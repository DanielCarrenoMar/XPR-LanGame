import { Router, type Request, type Response } from "express";
import { getBattleStatus, setBattleActive } from "#endpoints/adminState.js";
import { io } from "src/index.js";

const router = Router();

function getBattleController(_req: Request, res: Response): void {
	res.status(200).json({
		ok: true,
		battle: getBattleStatus(),
	});
}

router.get("/api/admin/battle", getBattleController);

type SetBattleBody = {
	active?: unknown;
};

function setBattleController(req: Request<unknown, unknown, SetBattleBody>, res: Response): void {
	const { active } = req.body;

	if (typeof active !== "boolean") {
		res.status(400).json({
			ok: false,
			error: "El campo 'active' debe ser booleano.",
		});
		return;
	}

	const battle = setBattleActive(active);
	io.emit("battleMode", battle.active);
	res.status(200).json({
		ok: true,
		battle,
	});
}

router.post("/api/admin/battle", setBattleController);

export default router;
