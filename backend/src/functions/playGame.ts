import {
  Lobby,
  Options,
  Player,
  PlayerStatus,
  Role,
  Round,
} from "./types";
import { assignRoles } from "./helpers/role";
import { Server } from "socket.io";
import preGame from "./phases/preGame";
import nightPhase from "./phases/night";
import discussionPhase from "./phases/discussion";
import votingPhase from "./phases/voting";
import getTeamWinners from "./helpers/getTeamWinners";

const defaultOptions = {
  discussionDuration: 5 * 60,
  votingDuration: 3 * 60,
  actionDuration: 5 * 60,
  resultsDuration: 5 * 60,
  preGameDuration: 5 * 60,
};

export default async function playGame(
  lobby: Lobby,
  roles: Role[],
  io: Server,
  options?: Options,
) {
  const playerRoles = assignRoles(lobby.players, roles);

  const playerStatus = new Map<Player["id"], PlayerStatus>();
  lobby.players.forEach((playerId) => {
    playerStatus.set(playerId, "Alive");
  });

  const round: Round = {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    playerRoles: playerRoles,
    playerStatus: playerStatus,
    options: options || defaultOptions,
    status: "PreGame",
  };

  lobby.rounds.push(round);

  io.to(lobby.id).emit("phaseChange", "PreGame");
  await preGame(
    lobby.players,
    round.playerRoles,
    round.options.preGameDuration,
  );

  // Start game
  io.to(lobby.id).emit("gameStarted");

  // Remove all calls
  io.to(lobby.id).emit("phaseChange", "Night");
  await nightPhase(round);

  // Add all calls, day music
  io.to(lobby.id).emit("phaseChange", "Discussion");
  await discussionPhase(lobby.players, round.options.discussionDuration);

  // Voting music
  io.to(lobby.id).emit("phaseChange", "Voting");
  const votes = await votingPhase(lobby.players, round);
  const winner = getTeamWinners(votes, round.playerRoles, playerStatus);

  io.to(lobby.id).emit("winner", winner);
  io.to(lobby.id).emit("phaseChange", "End");
}
