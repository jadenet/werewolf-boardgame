import { Server, Socket } from "socket.io";
import { getPlayerFromId, removeLobby, removePlayer, removePlayerFromLobby } from "../lobby/lobby";
import { toPlayerDTO } from "../lobby/playerDto";
import { Lobby, Player } from "../game/types";

// While a game is in progress, disconnected players are kept in the roster (shown as
// "Disconnected") since a round's votes/roles already depend on them. Before a game starts,
// they're removed outright.
export function registerDisconnectHandler(io: Server, socket: Socket, lobby: Lobby, player: Player) {
  socket.on("disconnect", () => {
    if (lobby.gameStarted) {
      const trackedPlayer = getPlayerFromId(player.id);
      if (trackedPlayer) {
        trackedPlayer.connected = false;
      }

      io.to(lobby.id).emit(
        "playersChanged",
        lobby.players.map((playerId) => toPlayerDTO(playerId))
      );
      return;
    }

    removePlayerFromLobby(lobby, player.id);
    removePlayer(player.id);

    if (lobby.players.length === 0) {
      removeLobby(lobby.id);
      return;
    }

    io.to(lobby.id).emit(
      "playersChanged",
      lobby.players.map((playerId) => toPlayerDTO(playerId))
    );
  });
}

