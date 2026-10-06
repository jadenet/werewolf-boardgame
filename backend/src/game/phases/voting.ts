import { Lobby, Round, Player } from "../types";
import { getPlayerFromId } from "../../lobby/lobby";
import { validateLynchingVote } from "../validator";

export default async function votingPhase(
  players: Lobby["players"],
  round: Round
) {
  // Key is voter player id, value is target player id.
  const votes: Map<Player["id"], Player["id"]> = new Map();

  // Emit voting start to all players
  players.forEach((playerId) => {
    const player = getPlayerFromId(playerId);
    if (player && player.socket) {
      player.socket.emit("startVoting", round.options.votingDuration);
    }
  });

  // Keep the phase open for vote changes until its timer expires.
  await new Promise<void>((resolve) => {
    let active = true;
    const handlers = new Map<Player["id"], (targetId: string) => void>();

    const finish = () => {
      if (!active) {
        return;
      }
      active = false;
      handlers.forEach((handler, playerId) => {
        const player = getPlayerFromId(playerId);
        if (player && !player.isBot) {
          player.socket?.off("vote", handler);
        }
      });
      resolve();
    };

    const voteHandler = (voterId: string, targetId: string) => {
      if (!active) {
        return;
      }

      const voter = getPlayerFromId(voterId);
      const target = getPlayerFromId(targetId);

      if (voter && target) {
        const voteSuccess = validateLynchingVote(voter.id, target.id, round.status);
        if (voteSuccess) {
          votes.set(voter.id, target.id);
          // Emit vote update to all players
          players.forEach((playerId) => {
            const player = getPlayerFromId(playerId);
            if (player && player.socket) {
              player.socket.emit("lynchVotesChange", Array.from(votes.entries()).map(([voter, target]) => [voter, target]));
            }
          });
        }
      }
    };

    // Set up vote listeners
    players.forEach((playerId) => {
      const player = getPlayerFromId(playerId);
      if (player && player.socket) {
        const handler = (targetId: string) => {
          voteHandler(player.id, targetId);
        };
        handlers.set(player.id, handler);
        if (player.isBot) {
          player.socket.once("vote", handler);
        } else {
          player.socket.on("vote", handler);
        }
      }
    });

    // Timeout after voting duration
    setTimeout(finish, round.options.votingDuration * 1000);
  });

  return votes;
}