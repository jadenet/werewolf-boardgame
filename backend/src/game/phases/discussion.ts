import { getPlayerFromId } from "../../lobby/lobby";
import { Player } from "../types";
import { validateDiscussionSkip } from "../validator";
import { Server } from "socket.io";

export default async function discussionPhase(
  players: Player["id"][],
  discussionDuration: number,
  io: Server,
  lobbyId: string
) {
  let discussionSkips: Player["id"][] = [];
  const requiredSkips = Math.floor(players.length / 2) + 1;

  // Emit discussion start to all players
  players.forEach((playerId) => {
    const player = getPlayerFromId(playerId);
    if (player && player.socket) {
      player.socket.emit("startDiscussion", discussionDuration);
    }
  });

  io.to(lobbyId).emit("discussionSkipUpdate", { votes: 0, required: requiredSkips });

  // Wait for discussion duration or majority skip
  await new Promise<void>((resolve) => {
    const skipHandler = (playerId: string) => {
      if (validateDiscussionSkip(discussionSkips, playerId)) {
        discussionSkips.push(playerId);
        io.to(lobbyId).emit("discussionSkipUpdate", { votes: discussionSkips.length, required: requiredSkips });
        if (discussionSkips.length >= requiredSkips) {
          resolve();
        }
      }
    };

    // Set up skip listeners
    players.forEach((playerId) => {
      const player = getPlayerFromId(playerId);
      if (player && player.socket) {
        player.socket.once("discussionSkip", () => {
          skipHandler(player.id);
        });
      }
    });

    // Timeout after discussion duration
    setTimeout(() => {
      resolve();
    }, discussionDuration * 1000);
  });
}