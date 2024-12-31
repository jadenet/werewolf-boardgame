import "dotenv/config";
import startGame from "../src/functions/startGame";
import { Lobby, Options, Player, Role } from "../src/functions/Interfaces";
import {
  createLobby,
  addPlayerToLobby,
  getLobbyFromId,
  removePlayerFromLobby,
  removeLobby,
} from "../src/functions/lobby";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { createServer } from "node:http";
import { Server } from "socket.io";
const app = express();
app.use(cors({ origin: "https://werewolf-peom.onrender.com" }));
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "https://werewolf-peom.onrender.com" },
});

let lobbies: Lobby[] = [];
const minimumPlayerCount = 3;

io.on("connection", (socket) => {
  socket.on(
    "lobbyjoin",
    (lobbyId: Lobby["id"], playerName: Player["name"], callback: Function) => {
      let lobby = getLobbyFromId(lobbies, lobbyId);
      if (!lobby) {
        callback({ isValidId: false });
        return;
      }

      const player: Player = {
        id: crypto.randomUUID(),
        name: playerName,
        socket: socket,
      };

      addPlayerToLobby(lobby, player);
      io.to(lobbyId).emit("playersChanged", lobby.players);


      socket.on("gameStart", (playerClicked: Player["id"], roles: Role[], options: Options) => {
        if (
          playerClicked === lobby.hostId &&
          lobby.players.length >= minimumPlayerCount
        ) {
          startGame(lobby, roles, io, options);
        }
      });

      // TODO once done with all socket events, search all .emit and .on to check for name consistency

      socket.on("disconnect", () => {
        removePlayerFromLobby(lobby, player);

        if (lobby.players.length > 0) {
          io.to(lobbyId).emit("playersChanged", lobby.players);
        } else {
          removeLobby(lobbies, lobby.id);
        }
      });
      callback({ isValidId: true, player: player });
    }
  );
});

app.use(bodyParser.json());

app.post("/lobbies", async (req, res) => {
  // TODO possibly remove or change this
  let formErrors: string[] = [];
  if (req.body.hostPlayerName === "") {
    formErrors.push("Enter a name");
  }

  if (formErrors.length === 0) {
    const lobby = createLobby();
    lobbies.push(lobby);
    res.send(JSON.stringify({ status: "success", id: lobby.id }));

    setTimeout(() => {
      if (lobby.players.length === 0) {
        removeLobby(lobbies, lobby.id);
      }
    });
  } else {
    res.send(JSON.stringify({ status: "error", errors: formErrors }));
  }
});

app.get("/lobbies", async (_, res) => {
  res.send(JSON.stringify(lobbies));
});

server.listen(Number(process.env.SERVER_PORT), "0.0.0.0", () => {});
