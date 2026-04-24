import { Player, Round } from "@/Interfaces";

export default function getVotesOnPlayerId(
  votes: Round["votes"],
  playerId: Player["id"]
) {
  // votes is now a Map where key is targetId and value is voterId
  // Count how many times this playerId appears as a key (target)
  let votesNum = 0;

  votes.forEach((_voterId, targetId) => {
    if (targetId === playerId) {
      votesNum += 1;
    }
  });

  return votesNum;
}
