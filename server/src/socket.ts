import { Server, Socket } from "socket.io";

type Player = {
  id: number;
  x: number;
  y: number;
};

let lastPlayerId = 0;

export function registerSockets(io: Server): void {
  io.on("connection", (socket: Socket) => {
    socket.on("newplayer", () => {
      const player: Player = {
        id: lastPlayerId++,
        x: randomInt(100, 400),
        y: randomInt(100, 400)
      };

      socket.data.player = player;
      socket.emit("allplayers", getAllPlayers(io));
      socket.broadcast.emit("newplayer", player);

      socket.on("posPlayer", (data: { x: number; y: number }) => {
        if (!socket.data.player) return;
        socket.data.player.x = data.x;
        socket.data.player.y = data.y;
        io.emit("move", socket.data.player);
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
}

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
