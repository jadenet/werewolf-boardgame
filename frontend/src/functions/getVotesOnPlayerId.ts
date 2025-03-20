import { Player, Round } from "@/Interfaces";

export default function getVotesOnPlayerId(
  votes: Round["votes"],
  playerId: Player["id"]
) {
  let votesNum = 0;

  votes.forEach((playerVotedId) => {
    if (playerVotedId === playerId) {
      votesNum += 1;
    }
  });

  return votesNum;
}
