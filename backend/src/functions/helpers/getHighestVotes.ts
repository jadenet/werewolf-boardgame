import { Player } from "../types";

export default function getHighestVotes(playerVotes: Map<Player["id"], Player["id"]>) {
  const voteCounts: Map<Player["id"], number> = new Map();

  for (const playerId of playerVotes.values()) {
    voteCounts.set(playerId, (voteCounts.get(playerId) ?? 0) + 1);
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