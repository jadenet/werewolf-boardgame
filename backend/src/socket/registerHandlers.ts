import { Server, Socket } from "socket.io";
import { Lobby, Player } from "../game/types";
import { registerLobbyJoinHandler } from "../lobby/handlers/lobbyJoin";
import { registerDisconnectHandler } from "../lobby/handlers/disconnect";
import { registerSendMessageHandler } from "../lobby/handlers/sendMessage";
import { registerAddBotHandler } from "../lobby/handlers/addBot";
import { registerRemoveBotHandler } from "../lobby/handlers/removeBot";
import { registerKickPlayerHandler } from "../lobby/handlers/kickPlayer";
import { registerUpdateSelectedRolesHandler } from "../lobby/handlers/updateSelectedRoles";
import { registerGameStartHandler } from "../game/handlers/gameStart";
import { registerPlayerClickedHandler } from "../game/handlers/playerClicked";

// Events available to a player once they are in a lobby.
function registerPlayerHandlers(io: Server, socket: Socket, lobby: Lobby, player: Player) {
  // Lobby
  registerDisconnectHandler(io, socket, lobby, player);
  registerSendMessageHandler(io, socket, lobby, lobby.id);
  registerAddBotHandler(io, socket, lobby);
  registerRemoveBotHandler(io, socket, lobby);
  registerKickPlayerHandler(io, socket, lobby);
  registerUpdateSelectedRolesHandler(io, socket, lobby);

  // Game
  registerGameStartHandler(io, socket, lobby);
  registerPlayerClickedHandler(socket, lobby);
}

export function registerSocketHandlers(io: Server) {
  io.on("connection", (socket) => {
    registerLobbyJoinHandler(io, socket, (lobby, player) => {
      registerPlayerHandlers(io, socket, lobby, player);
    });
  });
}
