import { Server, Socket } from "socket.io";
import { getPlayerFromId, removePlayer, removePlayerFromLobby } from "../lobby/lobby";
import { toPlayerDTO } from "../lobby/playerDto";
import { Lobby, Player } from "../game/types";

// Only the host can kick another player, and only before the game has started.
export function registerKickPlayerHandler(io: Server, socket: Socket, lobby: Lobby) {
  socket.on("kickPlayer", (playerClicked: Player["id"], targetPlayerId: Player["id"], callback?: Function) => {
    if (playerClicked !== lobby.hostId || lobby.gameStarted || targetPlayerId === playerClicked) {
      if (callback) callback({ success: false, error: "Not authorized or game already in progress" });
      return;
    }

    const targetPlayer = getPlayerFromId(targetPlayerId);
    if (!targetPlayer || !lobby.players.includes(targetPlayerId)) {
      if (callback) callback({ success: false, error: "Player not found" });
      return;
    }

    removePlayerFromLobby(lobby, targetPlayerId);
    removePlayer(targetPlayerId);

    if (!targetPlayer.isBot && targetPlayer.socket) {
      targetPlayer.socket.emit("kicked");
      targetPlayer.socket.disconnect(true);
    }

    io.to(lobby.id).emit(
      "playersChanged",
      lobby.players.map((playerInLobby) => toPlayerDTO(playerInLobby))
    );

    if (callback) callback({ success: true });
  });
}
