import { Player } from "../types";

export default function getHighestVotes(playerVotes: Map<Player["id"], Player["id"]>) {
  const voteCounts: Map<Player["id"], number> = new Map();

  for (const targetPlayerId of playerVotes.values()) {
    voteCounts.set(targetPlayerId, (voteCounts.get(targetPlayerId) ?? 0) + 1);
  }

  let highestCount = 0;
  let highestVotedPlayers: Player["id"][] = [];

  voteCounts.forEach((count, playerId) => {
    if (count > highestCount) {
      highestCount = count;
      highestVotedPlayers = [playerId];
    } else if (count === highestCount) {
      highestVotedPlayers.push(playerId);
    }
  });

  return highestVotedPlayers;
}