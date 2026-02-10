import { app } from "#src/app.js";
import { io } from "#src/index.js";
import { storedAddresses } from "./postAddress.js";
import type { Request, Response } from "express";

type ResetDispatchResult = {
	ip: string;
	port: number;
	url: string;
	ok: boolean;
	status?: number;
	error?: string;
};

function buildResetUrl(ip: string, port: number): string {
	const hasProtocol = /^https?:\/\//i.test(ip);
	const base = hasProtocol ? ip : `http://${ip}`;

	try {
		const url = new URL(base);
		url.port = String(port);
		url.pathname = "/reset";
		url.search = "";
		url.hash = "";
		return url.toString();
	} catch {
		return `http://${ip}:${port}/reset`;
	}
}

async function sendResetToAddress(ip: string, port: number): Promise<ResetDispatchResult> {
	const url = buildResetUrl(ip, port);

	console.log(`Sending reset to ${io.sockets.sockets.size}`);
	io.sockets.sockets.forEach((s) => {
		s.emit("reset");
	});

	return {
		ip,
		port,
		url,
		ok: true,
	};
	/*
	try {
		const response = await fetch(url, { method: "POST" });
		return {
			ip,
			port,
			url,
			ok: response.ok,
			status: response.status,
		};
	} catch (error) {
		return {
			ip,
			port,
			url,
			ok: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}*/
}

async function sendResetToAll(): Promise<ResetDispatchResult[]> {
	return Promise.all(
		storedAddresses.map((record) => sendResetToAddress(record.ip, record.port))
	);
}

async function sendResetController(_req: Request, res: Response): Promise<void> {
	if (storedAddresses.length === 0) {
		res.status(200).json({ ok: true, sent: 0, total: 0, results: [] });
		return;
	}

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
