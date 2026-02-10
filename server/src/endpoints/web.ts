import express, { Request, Response } from "express";
import { app } from "#src/app.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const webRoot = path.join(__dirname, "..", "web");

function getWebPagePath(): string {
	return path.join(webRoot, "index.html");
}

function getWebPageController(_req: Request, res: Response): void {
	res.sendFile(getWebPagePath());
}

app.get("/", getWebPageController);
app.use("/", express.static(webRoot));