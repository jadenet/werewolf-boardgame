import { Player } from "../Interfaces";
import { validateDiscussionSkip } from "../validator";

export default async function discussionPhase(
  players: Player[],
  discussionDuration: number
) {
  let discussionSkips: Player[] = [];

  // Emit discussion start to all players
  players.forEach((player) => {
    if (player.socket) {
      player.socket.emit("startDiscussion", discussionDuration);
    }
  });

  // Wait for discussion duration or majority skip
  await new Promise<void>((resolve) => {
    const skipHandler = (playerId: string) => {
      const player = players.find(p => p.id === playerId);
      if (player && validateDiscussionSkip(discussionSkips, player)) {
        discussionSkips.push(player);
        if (discussionSkips.length > players.length / 2) {
          resolve();
        }
      }
    };

    // Set up skip listeners
    players.forEach((player) => {
      if (player.socket) {
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
