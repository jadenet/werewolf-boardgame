import { Lobby, Round, Player } from "../types";
import { getPlayerFromId } from "../helpers/lobby";
import { validateLynchingVote } from "../validator";

export default async function votingPhase(
  players: Lobby["players"],
  round: Round
) {
  const votes: Map<Player["id"], Player["id"]> = new Map();

  // Emit voting start to all players
  players.forEach((playerId) => {
    const player = getPlayerFromId(playerId);
    if (player && player.socket) {
      player.socket.emit("startVoting", round.options.votingDuration);
    }
  });

  // Wait for all votes or timeout
  await new Promise<void>((resolve) => {
    let votesReceived = 0;
    const totalPlayers = players.length;

    const voteHandler = (voterId: string, targetId: string) => {
      const voter = getPlayerFromId(voterId);
      const target = getPlayerFromId(targetId);

      if (voter && target) {
        const voteSuccess = validateLynchingVote(voter.id, target.id, round.status);
        if (voteSuccess) {
          votes.set(target.id, voter.id);
          // Emit vote update to all players
          players.forEach((playerId) => {
            const player = getPlayerFromId(playerId);
            if (player && player.socket) {
              player.socket.emit("lynchVotesChange", Array.from(votes.entries()).map(([target, voter]) => [target, voter]));
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
    players.forEach((playerId) => {
      const player = getPlayerFromId(playerId);
      if (player && player.socket) {
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