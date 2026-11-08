import { Server, Socket } from "socket.io";
import { addPlayer, addPlayerToLobby, getLobbyFromId, getPlayerFromId, MAX_PLAYER_COUNT } from "../lobby";
import { toPlayerDTO } from "../playerDto";
import { Lobby, Player } from "../../game/types";
import { cancelPendingDisconnect } from "./disconnect";

export type OnPlayerInLobby = (lobby: Lobby, player: Player) => void;

// Handles a client's request to join (or rejoin) a lobby. Once the player is in the lobby,
// onPlayerInLobby is called so the caller can wire up the rest of that player's socket events.
export function registerLobbyJoinHandler(io: Server, socket: Socket, onPlayerInLobby: OnPlayerInLobby) {
  socket.on("lobbyreconnect", (lobbyId: Lobby["id"], playerId: Player["id"], callback: Function) => {
    const lobby = getLobbyFromId(lobbyId);
    const player = getPlayerFromId(playerId);
    if (!lobby || !player || !lobby.players.includes(playerId) || player.connected !== false) {
      callback({ success: false });
      return;
    }

    cancelPendingDisconnect(playerId);
    player.socket = socket;
    player.connected = true;
    socket.join(lobbyId);

    callback({
      success: true,
      player: { id: player.id, name: player.name, isHost: player.id === lobby.hostId },
    });
    socket.emit("selectedRolesChanged", lobby.selectedRoleIds);
    io.to(lobbyId).emit(
      "playersChanged",
      lobby.players.map((playerInLobby) => toPlayerDTO(playerInLobby))
    );

    onPlayerInLobby(lobby, player);
  });

  socket.on(
    "lobbyjoin",
    (lobbyId: Lobby["id"], playerName: Player["name"], callback: Function) => {
      console.log("Player joining lobby:", lobbyId, playerName);
      const lobby = getLobbyFromId(lobbyId);
      if (!lobby) {
        console.log("Lobby not found:", lobbyId);
        callback({ isValidId: false });
        return;
      }

      if (lobby.gameStarted || lobby.players.length >= MAX_PLAYER_COUNT) {
        callback({
          isValidId: false,
          error: lobby.gameStarted ? "Game already in progress" : "Lobby is full",
        });
        return;
      }

      socket.join(lobbyId);
      console.log("Socket joined room:", lobbyId);

      const player: Player = {
        id: crypto.randomUUID(),
        name: playerName,
        socket: socket,
        connected: true,
      };

      addPlayer(player);
      addPlayerToLobby(lobby, player.id);
      console.log("Player added to lobby. Total players:", lobby.players.length);

      io.to(lobbyId).emit(
        "playersChanged",
        lobby.players.map((playerInLobby: any) => toPlayerDTO(playerInLobby))
      );

      callback({
        isValidId: true,
        player: { id: player.id, name: player.name, isHost: player.id === lobby.hostId },
      });
      console.log("Join callback sent");

      // Let the newly joined client know the current role selection right away.
      socket.emit("selectedRolesChanged", lobby.selectedRoleIds);

      onPlayerInLobby(lobby, player);
    }
  );
}

