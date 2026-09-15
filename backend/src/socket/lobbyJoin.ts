import { Server, Socket } from "socket.io";
import { addPlayer, addPlayerToLobby, getLobbyFromId } from "../lobby/lobby";
import { toPlayerDTO } from "../lobby/playerDto";
import { Lobby, Player } from "../game/types";
import { registerGameStartHandler } from "./gameStart";
import { registerPlayerClickedHandler } from "./playerClicked";
import { registerSendMessageHandler } from "./sendMessage";
import { registerDisconnectHandler } from "./disconnect";
import { registerAddBotHandler } from "./addBot";
import { registerRemoveBotHandler } from "./removeBot";
import { registerKickPlayerHandler } from "./kickPlayer";
import { registerUpdateSelectedRolesHandler } from "./updateSelectedRoles";

// Handles a client's request to join a lobby, then wires up the rest of that player's socket events.
export function registerLobbyJoinHandler(io: Server, socket: Socket) {
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

      registerGameStartHandler(io, socket, lobby);
      registerPlayerClickedHandler(socket, lobby);
      registerSendMessageHandler(io, socket, lobby, lobbyId);
      registerDisconnectHandler(io, socket, lobby, player);
      registerAddBotHandler(io, socket, lobby);
      registerRemoveBotHandler(io, socket, lobby);
      registerKickPlayerHandler(io, socket, lobby);
      registerUpdateSelectedRolesHandler(io, socket, lobby);
    }
  );
}

