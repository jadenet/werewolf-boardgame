import { Server, Socket } from "socket.io";
import { addPlayer, addPlayerToLobby, getLobbyFromId, getPlayerFromId, MAX_PLAYER_COUNT } from "../lobby/lobby";
import { toPlayerDTO } from "../lobby/playerDto";
import { Lobby, Player } from "../game/types";
import { registerGameStartHandler } from "./gameStart";
import { registerPlayerClickedHandler } from "./playerClicked";
import { registerSendMessageHandler } from "./sendMessage";
import { cancelPendingDisconnect, registerDisconnectHandler } from "./disconnect";
import { registerAddBotHandler } from "./addBot";
import { registerRemoveBotHandler } from "./removeBot";
import { registerKickPlayerHandler } from "./kickPlayer";
import { registerUpdateSelectedRolesHandler } from "./updateSelectedRoles";

function registerPlayerLobbyHandlers(io: Server, socket: Socket, lobby: Lobby, player: Player) {
  registerGameStartHandler(io, socket, lobby);
  registerPlayerClickedHandler(socket, lobby);
  registerSendMessageHandler(io, socket, lobby, lobby.id);
  registerDisconnectHandler(io, socket, lobby, player);
  registerAddBotHandler(io, socket, lobby);
  registerRemoveBotHandler(io, socket, lobby);
  registerKickPlayerHandler(io, socket, lobby);
  registerUpdateSelectedRolesHandler(io, socket, lobby);
}

// Handles a client's request to join a lobby, then wires up the rest of that player's socket events.
export function registerLobbyJoinHandler(io: Server, socket: Socket) {
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

    registerPlayerLobbyHandlers(io, socket, lobby, player);
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

      registerPlayerLobbyHandlers(io, socket, lobby, player);
    }
  );
}

