import "dotenv/config";
import Game from "./functions/game";
import { Lobby, Ability, Player } from "./functions/Interfaces";
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
const app = express();
const server = createServer(app);
const originUrl =
  process.env.NODE_ENV === "production"
    ? "https://werewolf-peom.onrender.com"
    : "http://localhost:10000";
const io = new Server(server, { cors: { origin: originUrl } });

let lobbies: Lobby[] = [
  { id: 1, players: [], gameStarted: false, maxPlayers: 4 },
];

function createLobby(lobbyId: Lobby["id"]) {
  lobbies.push({
    id: lobbyId,
    players: [],
    gameStarted: false,
    maxPlayers: 4,
  });
}

function getLobbyFromId(id: number) {
  return lobbies.find((lobby) => {
    return lobby.id === id;
  });
}

io.on("connection", (socket) => {
  socket.on("lobbyjoin", (lobbyId, playerName) => {
    let lobby = getLobbyFromId(lobbyId);
    if (lobby) {
      let handlePlayerClick = (a, b) => {
        return "not woriing";
      };
      if (lobby.players.length < lobby.maxPlayers && !lobby.gameStarted) {
        socket.join(lobbyId);
        lobby.players.push({ name: playerName });
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
          (player) => player.name === playerName
        );
        lobby.players.splice(playerIndex, 1);
        io.to(lobbyId).emit("playersChanged", lobby.players);
      });
    }
  });
});

server.listen(Number(process.env.SERVER_PORT), "0.0.0.0", () => {});
