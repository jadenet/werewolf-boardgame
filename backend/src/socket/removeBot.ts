import { Server, Socket } from "socket.io";
import { getPlayerFromId, removePlayer, removePlayerFromLobby } from "../lobby/lobby";
import { toPlayerDTO } from "../lobby/playerDto";
import { Lobby, Player } from "../game/types";

// Only the host can remove a bot, and only before the game has started.
export function registerRemoveBotHandler(io: Server, socket: Socket, lobby: Lobby) {
  socket.on("removeBot", (playerClicked: Player["id"], botPlayerId: Player["id"], callback?: Function) => {
    const botPlayer = getPlayerFromId(botPlayerId);

    if (playerClicked !== lobby.hostId || lobby.gameStarted || !botPlayer?.isBot) {
      if (callback) callback({ success: false, error: "Not authorized or invalid bot" });
      return;
    }

    removePlayerFromLobby(lobby, botPlayerId);
    removePlayer(botPlayerId);

    io.to(lobby.id).emit(
      "playersChanged",
      lobby.players.map((playerInLobby) => toPlayerDTO(playerInLobby))
    );

    if (callback) callback({ success: true });
  });
}
