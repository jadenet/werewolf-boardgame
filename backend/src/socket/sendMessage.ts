import { Server, Socket } from "socket.io";
import { getPlayerFromId } from "../lobby/lobby";
import { Lobby } from "../game/types";

// Broadcasts a chat message to the lobby; chat is disabled for everyone during Night.
export function registerSendMessageHandler(io: Server, socket: Socket, lobby: Lobby, lobbyId: Lobby["id"]) {
  socket.on("sendMessage", (playerId: string, message: string) => {
    const sender = getPlayerFromId(playerId);
    if (!sender) {
      return;
    }

    const currentRound = lobby.rounds[lobby.rounds.length - 1];
    if (currentRound && currentRound.status === "Night") {
      return;
    }

    io.to(lobbyId).emit("messageReceived", {
      playerId: playerId,
      playerName: sender.name,
      message: message,
      timestamp: Date.now(),
    });
  });
}
