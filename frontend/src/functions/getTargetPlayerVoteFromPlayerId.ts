export default function getTargetPlayerVoteFromPlayerId(votes, playerId) {
  const vote = votes.find((vote) => {
    return vote.playerVoting.name === playerId;
  });
  return vote && vote.targetPlayer;
}
