import { getPlayerFromId } from "../helpers/lobby";
import { Player } from "../types";
import { validateDiscussionSkip } from "../validator";

export default async function discussionPhase(
  players: Player["id"][],
  discussionDuration: number
) {
  let discussionSkips: Player["id"][] = [];

  // Emit discussion start to all players
  players.forEach((playerId) => {
    const player = getPlayerFromId(playerId);
    if (player && player.socket) {
      player.socket.emit("startDiscussion", discussionDuration);
    }
  });

  // Wait for discussion duration or majority skip
  await new Promise<void>((resolve) => {
    const skipHandler = (playerId: string) => {
      if (validateDiscussionSkip(discussionSkips, playerId)) {
        discussionSkips.push(playerId);
        if (discussionSkips.length > players.length / 2) {
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