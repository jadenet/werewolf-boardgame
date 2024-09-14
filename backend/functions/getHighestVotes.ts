export default function getHighestVotes(votes, lobby) {
  const totalVotes = votes.map((vote) => {
    return vote.targetPlayer.id;
  });

  if (totalVotes.length > 0) {
    let frequencies = {};
    for (const vote of totalVotes) {
      frequencies[vote] = frequencies[vote] ? frequencies[vote] + 1 : 1;
    }

    let secondHighestVotesNumber = 0;
    let highestVotesNumber = 0;
    let highestPlayerName = "";

    for (const key in frequencies) {
      const isHigher = frequencies[key] > highestVotesNumber;
      if (isHigher) {
        secondHighestVotesNumber = highestVotesNumber;
        highestVotesNumber = frequencies[key];
        highestPlayerName = key;
      } else if (frequencies[key] === highestVotesNumber) {
        highestPlayerName = "";
      }
    }

    if (highestVotesNumber > secondHighestVotesNumber) {
      const playerIndex = lobby.players.findIndex((player) => {
        return player.id === highestPlayerName;
      });

      return playerIndex;
    }
  }
}
