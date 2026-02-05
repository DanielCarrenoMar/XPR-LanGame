import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import path from 'path';

type Player = {
  id: number;
  x: number;
  y: number;
};

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

let lastPlayerId = 0;

server.listen(process.env.PORT || 8081, () => {
  const address = server.address();
  const port = typeof address === "string" ? address : address?.port;
  console.log("Listening on " + "http://localhost:" + port);
});

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
