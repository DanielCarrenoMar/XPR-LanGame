import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";

type Player = {
    id: number;
    x: number;
    y: number;
    angle: number;
    frontModule: string;
    backModule: string;
};


let lastPlayerId = 0;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
    }
});

app.get("/", (_req, res) => {
    res.send("Multiplayer Game Server is running.");
});

server.listen(process.env.PORT || 8081, () => {
    const address = server.address();
    const port = typeof address === "string" ? address : address?.port;
    console.log("Listening on " + "http://localhost:" + port);
});

function getAllPlayers(server: Server): Player[] {
    const players: Player[] = [];
    server.sockets.sockets.forEach((s) => {
        const player = s.data.player as Player | undefined;
        if (player) players.push(player);
    });
    return players;
}


function randomInt(low: number, high: number): number {
    return Math.floor(Math.random() * (high - low) + low);
}

io.on("connection", (socket: Socket) => {
    socket.on("newplayer", (modules?: { frontModule: string, backModule: string }) => {
        const player: Player = {
            id: lastPlayerId++,
            x: randomInt(100, 400),
            y: randomInt(100, 400),
            angle: 0,
            frontModule: modules?.frontModule || "PISTOL",
            backModule: modules?.backModule || "SHIELD"
        };
        console.log(`Player connected: ${player.id}`);

        socket.data.player = player;
        socket.emit("playerId", player.id);
        socket.emit("allplayers", getAllPlayers(io));
        socket.broadcast.emit("newplayer", player);

        socket.on("posPlayer", (data: { x: number; y: number; angle: number }) => {
            if (!socket.data.player) return;
            socket.data.player.x = data.x;
            socket.data.player.y = data.y;
            socket.data.player.angle = data.angle;
        
            io.emit("move", socket.data.player);
        });

        socket.on("fire", (data: { x: number; y: number; angle: number }) => {
            // Broadcast the fire event to all other players
            socket.broadcast.emit("fire", { id: socket.data.player.id, ...data });
        });

        socket.on("playerHit", (targetId: number) => {
             // Find the target player and respawn them
             for (const [_, s] of io.sockets.sockets) {
                 if (s.data.player && s.data.player.id === targetId) {
                     s.data.player.x = randomInt(100, 400);
                     s.data.player.y = randomInt(100, 400);
                     io.emit("move", s.data.player); // "Reappear" at new position
                     break;
                 }
             }
        });

        socket.on("disconnect", () => {
            if (!socket.data.player) return;
            io.emit("remove", socket.data.player.id);
        });
    });

    socket.on("test", () => {
        console.log("test received");
    });
});
