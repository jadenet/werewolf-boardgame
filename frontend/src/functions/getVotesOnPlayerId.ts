import { Player, Round } from "../Interfaces";

export default function getVotesOnPlayerId(
  votes: Round["votes"],
  playerId: Player["id"]
) {
  // Votes map uses voter as key and target as value.
  // Count how many voters selected this player as target.
  let votesNum = 0;

  votes.forEach((targetId) => {
    if (targetId === playerId) {
      votesNum += 1;
    }
  });

  return votesNum;
}
