import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import { registerSocketHandlers } from "./manager.js";

export function initSockets(server: HttpServer): Server {
	const io = new Server(server, {
		cors: {
			origin: "*",
		},
	});

	registerSocketHandlers(io);
	return io;
}
