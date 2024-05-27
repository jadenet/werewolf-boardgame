import "dotenv/config";
import Game from "./functions/game";
import { Lobby, Ability, Player } from "./functions/Interfaces";
import express from "express";
import bodyParser from "body-parser";
import { createServer } from "node:http";
import { Server } from "socket.io";
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "https://werewolf-peom.onrender.com" },
});

let lobbies: Lobby[] = [
  { id: "1", players: [], gameStarted: false, maxPlayers: 4 },
];

function createLobby(potentialRoles: any[], gamemode) {
  const lobby = {
    id: crypto.randomUUID(),
    players: [],
    gameStarted: false,
    maxPlayers: 4,
    potentialRoles: potentialRoles,
    gamemode: gamemode,
  };
  lobbies.push(lobby);
  return lobby;
}

function getLobbyFromId(id: string) {
  return lobbies.find((lobby) => {
    return lobby.id === id;
  });
}

io.on("connection", (socket) => {
  socket.on("lobbyjoin", (lobbyId, playerName) => {
    let lobby = getLobbyFromId(lobbyId);
    if (lobby) {
      const playerId = crypto.randomUUID();
      let handlePlayerClick = (a, b) => {};
      if (lobby.players.length < lobby.maxPlayers && !lobby.gameStarted) {
        socket.join(lobbyId);
        lobby.players.push({
          id: playerId,
          name: playerName,
          isHost: lobby.players.length === 0,
        });
        io.to(lobbyId).emit("playersChanged", lobby.players);
      }

      socket.on("gameStart", (playerClicked) => {
        if (playerClicked === lobby.playerHost && lobby.players.length >= 4) {
          Game(lobby, io, socket);
        }
      });

      if (lobby.players.length >= 4) {
        Game(lobby, io, socket);
      }

      socket.on("disconnect", () => {
        const playerIndex = lobby.players.findIndex(
          (player) => player.id === playerId
        );
        playerIndex !== -1 && lobby.players.splice(playerIndex, 1);

        if (lobby.players.length > 0) {
          io.to(lobbyId).emit("playersChanged", lobby.players);
        } else {
          lobbies.splice(
            lobbies.findIndex((lob) => {
              lob.id === lobbyId;
            }),
            1
          );
        }
      });
    }
  });
});

app.use(bodyParser.json());

app.post("/", async (req, res) => {
  let formErrors: string[] = [];
  if (req.body.hostPlayerName === "") {
    formErrors.push("Enter a name");
  }

  if (formErrors.length === 0) {
    const lobby = createLobby(req.body.roles, req.body.gamemode);
    res.send(JSON.stringify({ status: "success", id: lobby.id }));
  } else {
    res.send(JSON.stringify({ status: "error", errors: formErrors }));
  }
});

server.listen(Number(process.env.SERVER_PORT), "0.0.0.0", () => {});
