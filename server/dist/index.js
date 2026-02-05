import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from 'path';
import { registerSockets } from "./socket.js";
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const publicDir = path.join(import.meta.dirname, "..", "public");
app.use("/css", express.static(path.join(publicDir, "css")));
app.use("/js", express.static(path.join(publicDir, "js")));
app.use("/assets", express.static(path.join(publicDir, "assets")));
app.get("/", (req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
});
server.listen(process.env.PORT || 8081, () => {
    const address = server.address();
    const port = typeof address === "string" ? address : address?.port;
    console.log("Listening on " + "http://localhost:" + port);
});
registerSockets(io);
