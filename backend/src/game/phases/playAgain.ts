import { Server } from "socket.io";
import { Lobby, Player } from "../types";
import { getPlayerFromId } from "../../lobby/lobby";

const PLAY_AGAIN_VOTE_DURATION_SECONDS = 30;

// Waits for a majority of players to vote to play another round, similar to the discussion skip vote.
export default async function playAgainPhase(lobby: Lobby, io: Server) {
  const players = lobby.players;
  const votedPlayerIds = new Set<Player["id"]>();
  const requiredVotes = Math.floor(players.length / 2) + 1;

  io.to(lobby.id).emit("playAgainVoteUpdate", { votes: 0, required: requiredVotes });

  return new Promise<boolean>((resolve) => {
    let settled = false;
    const finish = (playAgain: boolean) => {
      if (settled) {
        return;
      }
      settled = true;
      resolve(playAgain);
    };

    players.forEach((playerId) => {
      const player = getPlayerFromId(playerId);
      if (player && player.socket) {
        player.socket.once("playAgainVote", () => {
          if (votedPlayerIds.has(playerId)) {
            return;
          }

          votedPlayerIds.add(playerId);
          io.to(lobby.id).emit("playAgainVoteUpdate", { votes: votedPlayerIds.size, required: requiredVotes });

          if (votedPlayerIds.size >= requiredVotes) {
            finish(true);
          }
        });
      }
    });

    setTimeout(() => {
      finish(false);
    }, PLAY_AGAIN_VOTE_DURATION_SECONDS * 1000);
  });
}
