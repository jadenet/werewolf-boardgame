import { Lobby, Options, Role, Round } from "./Interfaces";
import { assignRoles } from "./roles";
import nightPhase from "./phases/nightPhase";
import discussionPhase from "./phases/discussionPhase";
import votingPhase from "./phases/votingPhase";
import preGame from "./phases/preGame";
import { Server } from "socket.io";
import { getAbilitiesFromRoles } from "./actions";
import checkGameConditions from "./checkgameconditions";

const defaultOptions = {
  discussionDuration: 5 * 60,
  votingDuration: 3 * 60,
  actionDuration: 5 * 60,
  resultsDuration: 5 * 60,
};

export default async function startGame(
  lobby: Lobby,
  roles: Role[],
  io: Server,
  options?: Options
) {
  const [cards, playerRoles, playerStatus] = assignRoles(lobby.players, roles);

  const round: Round = {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    cards: cards,
    playerRoles: playerRoles,
    playerStatus: playerStatus,
    options: options || defaultOptions,
    status: "Begin",
  };

  lobby.rounds.push(round);

  io.to(lobby.id).emit("phaseChange", "Start");
  await preGame();

  // remove all calls
  // music, narrator, etc
  io.to(lobby.id).emit("phaseChange", "Night");
  const abilities = getAbilitiesFromRoles(playerRoles, roles);
  await nightPhase(round, abilities);

  // add all calls, day music
  io.to(lobby.id).emit("phaseChange", "Day");
  await discussionPhase(lobby.players, round.options.discussionDuration);

  io.to(lobby.id).emit("phaseChange", "Voting");
  const votes = await votingPhase(lobby.players, round);
  const winner = checkGameConditions(votes, round.playerRoles, playerStatus);

  io.to(lobby.id).emit("winner", winner);
  io.to(lobby.id).emit("phaseChange", "End");
}
