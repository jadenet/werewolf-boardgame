import { Lobby, Round, Player } from "../Interfaces";
import { findPlayerFromId } from "../lobby";
import { validateLynchingVote } from "../validator";

export default async function votingPhase(
  players: Lobby["players"],
  round: Round
) {
  const votes: Map<Player, Player> = new Map();
  await new Promise<void>((resolve) => {
    players.forEach((player) => {
      player.socket && player.socket
        .timeout(round.options.votingDuration * 1000)
        .emit("vote", (err: Error, res: Player["id"]) => {
          if (err) {
            resolve();
          }
          const targetPlayer = findPlayerFromId(players, res);
          if (targetPlayer) {
            const voteSuccess = validateLynchingVote(
              player,
              targetPlayer,
              round.status
            );
            if (voteSuccess) {
              votes.set(targetPlayer, player);
            }
          }

          if (votes.size === players.length) {
            resolve();
          }
        });
    });
  });

  return votes;
}
