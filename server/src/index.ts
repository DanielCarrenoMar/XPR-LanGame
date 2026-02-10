import { Server, Socket } from "socket.io";
import { server } from "./app.js";
import "#endpoints/postAddress.js";
import "#endpoints/sendReset.js";
import "#endpoints/web.js";
import { AddressInfo } from "net";

type Player = {
    id: number;
    x: number;
    y: number;
    angle: number;
    frontModule: string;
    backModule: string;
};


let lastPlayerId = 0;

const io = new Server(server, {
    cors: {
        origin: '*',
    }
});

server.listen(process.env.PORT || 8081, () => {
    const address = server.address() as AddressInfo;
    const port = address.port;
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
    socket.on("newplayer", (data: { frontModule: string; backModule: string; x: number; y: number }) => {
        const player: Player = {
            id: lastPlayerId++,
            x: data.x,
            y: data.y,
            angle: 0,
            frontModule: data.frontModule,
            backModule: data.backModule
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
            if (!socket.data.player) return;
            io.sockets.sockets.forEach((s) => {
                const player = s.data.player as Player | undefined;
                if (player && player.id === targetId) {
                    s.emit("hit", { fromId: socket.data.player.id, targetId });
                }
            });
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
