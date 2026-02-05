let lastPlayerId = 0;
export function registerSockets(io) {
    io.on("connection", (socket) => {
        socket.on("newplayer", () => {
            const player = {
                id: lastPlayerId++,
                x: randomInt(100, 400),
                y: randomInt(100, 400)
            };
            socket.data.player = player;
            socket.emit("playerId", player.id);
            socket.emit("allplayers", getAllPlayers(io));
            socket.broadcast.emit("newplayer", player);
            socket.on("posPlayer", (data) => {
                if (!socket.data.player)
                    return;
                socket.data.player.x = data.x;
                socket.data.player.y = data.y;
                io.emit("move", socket.data.player);
            });
            socket.on("disconnect", () => {
                if (!socket.data.player)
                    return;
                io.emit("remove", socket.data.player.id);
            });
        });
        socket.on("test", () => {
            console.log("test received");
        });
    });
}
function getAllPlayers(server) {
    const players = [];
    server.sockets.sockets.forEach((s) => {
        const player = s.data.player;
        if (player)
            players.push(player);
    });
    return players;
}
function randomInt(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}
