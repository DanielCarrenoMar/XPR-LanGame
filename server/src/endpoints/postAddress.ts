import { app } from "#src/app.js";
import { Request, Response, Router } from "express";

const router = Router();

type ServerAddress = {
	ip: string;
	port: number;
	createdAt: number;
};

export const storedAddresses: ServerAddress[] = [];

function saveAddress(ip: string, port: number): ServerAddress {
	const record: ServerAddress = { ip, port, createdAt: Date.now() };
	console.log("Received address:", record);
	storedAddresses.push(record);
	return record;
}

function postAddressController(req: Request, res: Response): void {
	const { ip, port } = req.body as { ip?: string; port?: number };

	if (typeof ip !== "string" || ip.trim().length === 0) {
		res.status(400).json({ error: "ip is required" });
		return;
	}

	if (typeof port !== "number" || Number.isNaN(port) || port <= 0) {
		res.status(400).json({ error: "port must be a positive number" });
		return;
	}

	const record = saveAddress(ip.trim(), port);
	res.status(201).json({ ok: true, data: record });
}

router.post("/postAddress", postAddressController);

export default router;