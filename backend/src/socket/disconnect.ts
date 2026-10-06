import { Server, Socket } from "socket.io";
import { getPlayerFromId, removeLobby, removePlayer, removePlayerFromLobby } from "../lobby/lobby";
import { toPlayerDTO } from "../lobby/playerDto";
import { Lobby, Player } from "../game/types";

const RECONNECT_GRACE_PERIOD_MS = 60_000;
const pendingDisconnects = new Map<Player["id"], ReturnType<typeof setTimeout>>();

export function cancelPendingDisconnect(playerId: Player["id"]) {
  const timeout = pendingDisconnects.get(playerId);
  if (timeout) {
    clearTimeout(timeout);
    pendingDisconnects.delete(playerId);
  }
}

// While a game is in progress, disconnected players are kept in the roster (shown as
// "Disconnected") since a round's votes/roles already depend on them. Before a game starts,
// they remain reserved briefly so an automatic socket reconnect can restore the same player.
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

    player.connected = false;
    player.socket = undefined;
    const timeout = setTimeout(() => {
      pendingDisconnects.delete(player.id);
      if (player.connected !== false || lobby.gameStarted) {
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
    }, RECONNECT_GRACE_PERIOD_MS);
    pendingDisconnects.set(player.id, timeout);

    io.to(lobby.id).emit(
      "playersChanged",
      lobby.players.map((playerId) => toPlayerDTO(playerId))
    );
  });
}

