import { Server, Socket } from "socket.io";
import startGame from "../game/playGame";
import { getRequiredRoleCount } from "../game/services/role";
import { Lobby, Player } from "../game/types";

const MINIMUM_PLAYER_COUNT = 3;

// Only the host can start the game, and only once there are enough players and the role
// selection (if customized) matches the current player count exactly (players + 3 for center).
export function registerGameStartHandler(io: Server, socket: Socket, lobby: Lobby) {
  socket.on("gameStart", (playerClicked: Player["id"], callback?: Function) => {
    if (
      playerClicked !== lobby.hostId ||
      lobby.players.length < MINIMUM_PLAYER_COUNT ||
      lobby.gameStarted
    ) {
      if (callback) callback({ success: false, error: "Not authorized or insufficient players" });
      return;
    }

    if (lobby.selectedRoleIds.length > 0) {
      const requiredRoleCount = getRequiredRoleCount(lobby.players.length);
      if (lobby.selectedRoleIds.length !== requiredRoleCount) {
        if (callback) {
          callback({
            success: false,
            error: `Select ${requiredRoleCount} roles for ${lobby.players.length} players (currently ${lobby.selectedRoleIds.length}).`,
          });
        }
        return;
      }
    }

    // Acknowledge immediately, then start the game asynchronously without awaiting.
    if (callback) callback({ success: true });
    startGame(lobby, io).catch((error) => {
      console.error("Error during game:", error);
    });
  });
}

