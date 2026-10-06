import { Player } from "./Interfaces";

export default function getHighestVotes(votes: Map<Player, Player>) {
  const votedPlayers: Map<Player, number> = new Map();

  for (const player of votes.values()) {
    const playerVotesCount = votedPlayers.get(player);
    votedPlayers.set(player, playerVotesCount ? playerVotesCount + 1 : 1);
  }

  if (votedPlayers.size === 0) {
    return [];
  }

  const highestPlayerVoted: { count: number; players: Player[] } = {
    count: 0,
    players: [],
  };

  votedPlayers.forEach((count, player) => {
    if (count >= highestPlayerVoted.count) {
      highestPlayerVoted.count = count;
      highestPlayerVoted.players.push(player);
    }
  });

  return highestPlayerVoted.players;
}
