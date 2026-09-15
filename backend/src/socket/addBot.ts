import { Server, Socket } from "socket.io";
import { createBotPlayer } from "../lobby/lobby";
import { toPlayerDTO } from "../lobby/playerDto";
import { Lobby, Player } from "../game/types";

const MAX_PLAYER_COUNT = 10;

// Only the host can add a bot, and only before the game has started.
export function registerAddBotHandler(io: Server, socket: Socket, lobby: Lobby) {
  socket.on("addBot", (playerClicked: Player["id"], callback?: Function) => {
    if (playerClicked !== lobby.hostId || lobby.gameStarted) {
      if (callback) callback({ success: false, error: "Not authorized or game already in progress" });
      return;
    }

    if (lobby.players.length >= MAX_PLAYER_COUNT) {
      if (callback) callback({ success: false, error: "Lobby is full" });
      return;
    }

    createBotPlayer(lobby);

    io.to(lobby.id).emit(
      "playersChanged",
      lobby.players.map((playerInLobby) => toPlayerDTO(playerInLobby))
    );

    if (callback) callback({ success: true });
  });
}
