import "dotenv/config";
import startGame from "./functions/playGame";
import { Lobby, Player } from "./functions/types";
import {
  createLobby,
  addPlayerToLobby,
  addPlayer,
  getLobbyFromId,
  removePlayerFromLobby,
  removePlayer,
  removeLobby,
  getPlayerFromId,
  getLobbies,
} from "./functions/helpers/lobby";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { createServer } from "node:http";
import { Server } from "socket.io";
const app = express();
app.use(cors({
  origin: process.env.NODE_ENV === "production"
    ? "https://werewolf-peom.onrender.com"
    : ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000"]
}));
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === "production"
      ? "https://werewolf-peom.onrender.com"
      : ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000"]
  }
});
const minimumPlayerCount = 4;

function toPlayerDTO(playerId: Player["id"]) {
  const player = getPlayerFromId(playerId);
  if (!player) return { id: playerId, name: "Unknown" };
  return { id: player.id, name: player.name };
}

io.on("connection", (socket) => {
  socket.on(
    "lobbyjoin",
    (lobbyId: Lobby["id"], playerName: Player["name"], callback: Function) => {
      console.log("Player joining lobby:", lobbyId, playerName);
      let lobby = getLobbyFromId(lobbyId);
      if (!lobby) {
        console.log("Lobby not found:", lobbyId);
        callback({ isValidId: false });
        return;
      }

      socket.join(lobbyId)
      console.log("Socket joined room:", lobbyId);

      const player: Player = {
        id: crypto.randomUUID(),
        name: playerName,
        socket: socket,
      };

      addPlayer(player);
      addPlayerToLobby(lobby, player.id);
      console.log("Player added to lobby. Total players:", lobby.players.length);

      io.to(lobbyId).emit(
        "playersChanged",
        lobby.players.map((playerInLobby) => {
          return toPlayerDTO(playerInLobby);
        })
      );

      callback({
        isValidId: true,
        player: { id: player.id, name: player.name, isHost: player.id === lobby.hostId }
      });
      console.log("Join callback sent");

      socket.on(
        "gameStart",
        (playerClicked: Player["id"], callback?: Function) => {
          if (
            playerClicked === lobby.hostId &&
            lobby.players.length >= minimumPlayerCount
          ) {
            // Acknowledge immediately, then start the game
            if (callback) callback({ success: true });

            // Start game asynchronously without awaiting
            startGame(lobby, io).catch(error => {
              console.error("Error during game:", error);
              // Could emit an error event to all players if needed
            });
          } else {
            if (callback) callback({ success: false, error: "Not authorized or insufficient players" });
          }
        }
      );

      socket.on("playerClicked", (currentPlayerId: string, targetPlayerId: string) => {
        // Handle player selection for voting or abilities
        const currentPlayer = getPlayerFromId(currentPlayerId);
        const targetPlayer = getPlayerFromId(targetPlayerId);

        if (currentPlayer && targetPlayer && lobby.rounds.length > 0) {
          const currentRound = lobby.rounds[lobby.rounds.length - 1];

          if (currentRound.status === "Voting") {
            // Handle voting
            socket.emit("vote", currentPlayerId, targetPlayerId);
          }
        }
      });

      socket.on("sendMessage", (playerId: string, message: string) => {
        const sender = getPlayerFromId(playerId);
        if (sender && lobby.rounds.length > 0) {
          const currentRound = lobby.rounds[lobby.rounds.length - 1];
          if (currentRound.status !== "Night") {
            io.to(lobbyId).emit("messageReceived", {
              playerId: playerId,
              playerName: sender.name,
              message: message,
              timestamp: Date.now(),
            });
          }
        } else if (sender) {
          io.to(lobbyId).emit("messageReceived", {
            playerId: playerId,
            playerName: sender.name,
            message: message,
            timestamp: Date.now(),
          });
        }
      });

      socket.on("disconnect", () => {
        removePlayerFromLobby(lobby, player.id);
        removePlayer(player.id);

        if (lobby.players.length > 0) {
          io.to(lobbyId).emit(
            "playersChanged",
            lobby.players.map((playerId) => {
              return toPlayerDTO(playerId);
            })
          );
        } else {
          removeLobby(lobby.id);
        }
      });

      //callback({ isValidId: true, player: toPlayerDTO(player.id) });
    }
  );
});

app.use(bodyParser.json());

app.post("/lobbies", async (_req, res) => {
  // Lobby creation doesn't require a name - name is provided when joining
  const lobby = createLobby();
  res.send(JSON.stringify({ status: "success", id: lobby.id }));

  setTimeout(() => {
    if (lobby.players.length === 0) {
      removeLobby(lobby.id);
    }
  }, 10 * 1000);
});

app.get("/lobbies", async (_, res) => {
  res.send(JSON.stringify(getLobbies()));
});

app.get("/lobbies/:id", async (req, res) => {
  const lobby = getLobbyFromId(req.params.id);
  res.send(lobby != undefined)
});

app.get("/roles", async (_, res) => {
  res.sendFile("./assets/roles.json", { root: import.meta.dirname });
});

server.listen(Number(process.env.SERVER_PORT), "0.0.0.0", () => {});
