import {
  Lobby,
  Options,
  Player,
  PlayerStatus,
  Round,
} from "./types";
import { assignRoles, getRoleById } from "./services/role";
import { getPlayerFromId } from "../lobby/lobby";
import { Server } from "socket.io";
import preGame from "./phases/preGame";
import nightPhase from "./phases/night";
import discussionPhase from "./phases/discussion";
import votingPhase from "./phases/voting";
import getTeamWinners from "./helpers/getTeamWinners";
import playAgainPhase from "./phases/playAgain";

const defaultOptions: Options = {
  discussionDuration: 60,
  votingDuration: 60,
  actionDuration: 60,
  resultsDuration: 60,
  preGameDuration: 10,
};

async function playRound(lobby: Lobby, io: Server) {
  const { playerRoles, centerRoles } = assignRoles(lobby.players, lobby.selectedRoleIds);

  const playerStatus = new Map<Player["id"], PlayerStatus>();
  lobby.players.forEach((playerId) => {
    playerStatus.set(playerId, "Alive");
  });

  const round: Round = {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    playerRoles: playerRoles,
    playerStatus: playerStatus,
    centerRoles: centerRoles,
    status: "PreGame",
    options: defaultOptions,
  };

  lobby.rounds.push(round);

  io.to(lobby.id).emit("phaseChange", "PreGame");
  io.to(lobby.id).emit("startPreGame", defaultOptions.preGameDuration);

  // Send playerStatus to all players so they know who's alive
  const playerStatusArray = Array.from(playerStatus.entries());
  io.to(lobby.id).emit("playerStatusUpdate", playerStatusArray);

  // Send each player their assigned role
  lobby.players.forEach((playerId) => {
    const roleIds = playerRoles.get(playerId);
    const player = getPlayerFromId(playerId);
    if (roleIds && roleIds.length > 0 && player && player.socket) {
      const roleId = roleIds[0];
      const roleData = getRoleById(roleId);
      if (roleData) {
        player.socket.emit("shareRole", {
          id: roleData.id,
          name: roleData.name,
          image: roleData.image,
        });
      }
    }
  });

  await preGame(
    lobby.players,
    round.playerRoles,
    defaultOptions.preGameDuration,
  );

  // Start game
  io.to(lobby.id).emit("gameStarted");

  // Remove all calls
  round.status = "Night";
  io.to(lobby.id).emit("phaseChange", "Night");
  await nightPhase(round);

  // Add all calls, day music
  round.status = "Discussion";
  io.to(lobby.id).emit("phaseChange", "Discussion");
  await discussionPhase(lobby.players, defaultOptions.discussionDuration, io, lobby.id);

  // Voting music
  round.status = "Voting";
  io.to(lobby.id).emit("phaseChange", "Voting");
  const votes = await votingPhase(lobby.players, round);
  round.votes = votes;
  const winner = getTeamWinners(votes, round.playerRoles, playerStatus);
  round.teamWinner = winner;

  // Emit updated playerStatus after elimination
  const updatedPlayerStatusArray = Array.from(playerStatus.entries());
  io.to(lobby.id).emit("playerStatusUpdate", updatedPlayerStatusArray);

  round.status = "End";
  io.to(lobby.id).emit("winner", winner);
  io.to(lobby.id).emit(
    "centerRolesReveal",
    round.centerRoles.map((roleId) => getRoleById(roleId)).filter(Boolean)
  );
  io.to(lobby.id).emit("phaseChange", "End");
}

export default async function playGame(
  lobby: Lobby,
  io: Server,
) {
  lobby.gameStarted = true;

  let playAnotherRound = true;
  while (playAnotherRound) {
    await playRound(lobby, io);
    playAnotherRound = await playAgainPhase(lobby, io);
  }

  lobby.gameStarted = false;
  io.to(lobby.id).emit("returnToLobby");
}

