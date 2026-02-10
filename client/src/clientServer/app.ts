import express, { Request, Response } from "express";
import path from "path";
import http from "http";
import { fileURLToPath } from "url";
import { readFile, writeFile } from "fs/promises";

const app = express();
const server = http.createServer(app);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourcePath = path.resolve(__dirname, "modificable.reset.ts");
const targetPath = path.resolve(__dirname, "..", "modificable.ts");

app.use(express.json());

async function resetModificable(): Promise<void> {
	const source = await readFile(sourcePath, "utf8");
	await writeFile(targetPath, source, "utf8");
}

async function resetController(_req: Request, res: Response): Promise<void> {
	try {
        console.log("Received /reset request, resetting modificable.ts...");
		await resetModificable();
		res.status(200).json({ ok: true });
	} catch (error) {
		res.status(500).json({
			ok: false,
			error: error instanceof Error ? error.message : "Unknown error",
		});
	}
}

app.post("/reset", resetController);

export { app, server };
