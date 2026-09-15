import { Socket } from "socket.io";
import { getPlayerFromId } from "../lobby/lobby";
import { Lobby } from "../game/types";

// Forwards a player's click on another player as a vote while a Voting round is active.
export function registerPlayerClickedHandler(socket: Socket, lobby: Lobby) {
  socket.on("playerClicked", (currentPlayerId: string, targetPlayerId: string) => {
    const currentPlayer = getPlayerFromId(currentPlayerId);
    const targetPlayer = getPlayerFromId(targetPlayerId);

    if (!currentPlayer || !targetPlayer || lobby.rounds.length === 0) {
      return;
    }

    const currentRound = lobby.rounds[lobby.rounds.length - 1];
    if (currentRound.status === "Voting") {
      socket.emit("vote", currentPlayerId, targetPlayerId);
    }
  });
}
