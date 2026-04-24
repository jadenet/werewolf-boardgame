import { Lobby, Round, Player } from "../Interfaces";
import { findPlayerFromId } from "../lobby";
import { validateLynchingVote } from "../validator";

export default async function votingPhase(
  players: Lobby["players"],
  round: Round
) {
  const votes: Map<Player, Player> = new Map();

  // Emit voting start to all players
  players.forEach((player) => {
    if (player.socket) {
      player.socket.emit("startVoting", round.options.votingDuration);
    }
  });

  // Wait for all votes or timeout
  await new Promise<void>((resolve) => {
    let votesReceived = 0;
    const totalPlayers = players.length;

    const voteHandler = (voterId: string, targetId: string) => {
      const voter = findPlayerFromId(players, voterId);
      const target = findPlayerFromId(players, targetId);

      if (voter && target) {
        const voteSuccess = validateLynchingVote(voter, target, round.status);
        if (voteSuccess) {
          votes.set(target, voter);
          // Emit vote update to all players
          players.forEach((player) => {
            if (player.socket) {
              player.socket.emit("lynchVotesChange", Array.from(votes.entries()).map(([target, voter]) => [target.id, voter.id]));
            }
          });
        }
      }

      votesReceived++;
      if (votesReceived >= totalPlayers) {
        resolve();
      }
    };

    // Set up vote listeners
    players.forEach((player) => {
      if (player.socket) {
        player.socket.once("vote", (targetId: string) => {
          voteHandler(player.id, targetId);
        });
      }
    });

    // Timeout after voting duration
    setTimeout(() => {
      resolve();
    }, round.options.votingDuration * 1000);
  });

  return votes;
}
