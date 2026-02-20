import express from "express";
import http from "http";

import sendReset from "#endpoints/sendReset.js";
import webRouter from "#endpoints/web.js";
import playerRouter from "#endpoints/players.js";
import leaderboardRouter from "#endpoints/leaderboard.js";
import battleRouter from "#endpoints/battle.js";

const app = express();
const server = http.createServer(app);

app.use(express.json());

app.use("/", sendReset)
app.use("/", webRouter)
app.use("/", playerRouter)
app.use("/", leaderboardRouter)
app.use("/", battleRouter)

export { app, server };
