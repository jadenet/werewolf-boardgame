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
  preGameDuration: 5 * 60,
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
    status: "Pregame",
  };

  lobby.rounds.push(round);

  io.to(lobby.id).emit("phaseChange", "PreGame");
  await preGame(lobby.players, round.playerRoles, round.options.preGameDuration);

  // remove all calls
  // music, narrator, etc
  const abilities = getAbilitiesFromRoles(playerRoles, roles);
  io.to(lobby.id).emit("phaseChange", "Night");
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
