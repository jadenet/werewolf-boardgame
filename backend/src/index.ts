import "dotenv/config";
import { createLobby, getLobbyFromId, getLobbies, removeLobby } from "./lobby/lobby";
import { registerLobbyJoinHandler } from "./socket/lobbyJoin";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { createServer } from "node:http";
import { Server } from "socket.io";

const ALLOWED_ORIGINS = process.env.NODE_ENV === "production"
  ? "https://werewolf-peom.onrender.com"
  : ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000"];

const app = express();
app.use(cors({ origin: ALLOWED_ORIGINS }));
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: ALLOWED_ORIGINS },
});

io.on("connection", (socket) => {
  registerLobbyJoinHandler(io, socket);
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
  }, 60 * 1000);
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
