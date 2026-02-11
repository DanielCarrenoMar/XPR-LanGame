import { app } from "#src/app.js";
import { io } from "#src/index.js";
import type { Request, Response } from "express";

type ResetDispatchResult = {
	ip: string;
	port: number;
	url: string;
	ok: boolean;
	status?: number;
	error?: string;
};

async function sendResetToAll(): Promise<ResetDispatchResult[]> {

	console.log(`Sending reset to ${io.sockets.sockets.size}`);
	io.sockets.sockets.forEach((s) => {
		s.emit("reset");
	});

	return [
		{
			ip: "broadcast",
			port: 0,
			url: "socket.io broadcast",
			ok: true,
		}
	];
}

async function sendResetController(_req: Request, res: Response): Promise<void> {

	const results = await sendResetToAll();
	const sent = results.filter((result) => result.ok).length;

	res.status(200).json({
		ok: sent === results.length,
		sent,
		total: results.length,
		results,
	});
}

app.post("/sendReset", sendResetController);
