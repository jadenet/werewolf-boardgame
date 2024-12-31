import { Player } from "../Interfaces";
import { validateDiscussionSkip } from "../validator";

export default async function discussionPhase(
  players: Player[],
  discussionDuration: number
) {
  let discussionSkips: Player[] = [];
  players.forEach(async (player) => {
    const response = await player.socket
      .timeout(discussionDuration * 1000)
      .emitWithAck("discussionSkipRequest");
    if (response && validateDiscussionSkip(discussionSkips, player)) {
      discussionSkips.push(player);
      if (discussionSkips.length > players.length / 2) {
        return;
      }
    }
  });
}
