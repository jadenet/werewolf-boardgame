export default function getVotesOnPlayerId(votes, playerId) {
  let votesNum = 0;

  votes.map((vote) => {
    if (vote.targetPlayer.name === playerId) {
      votesNum += 1;
    }
  });

  return votesNum;
}
