import "dotenv/config";
import getRoles from "./game/getroles";
import assignRoles from "./game/assignroles";
import checkGameConditions from "./game/checkgameconditions";
import {
  validateAbility,
  validateLynchingVote,
  validateWerewolfVote,
} from "./game/validator";
import createTimer from "./game/createTimer";

const discussionDuration = 10;
const votingDuration = 5;
const nightDuration = 5;
const interludeDuration = 3;
let currentChats = ["Werewolves", "Medium and dead", "Lovers"];

import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
const app = express();
const server = createServer(app);
const originUrl =
  process.env.NODE_ENV === "production"
    ? "https://werewolf-peom.onrender.com"
    : "http://localhost:10000";

const io = new Server(server, { cors: { origin: originUrl } });

const rooms = ["-all", "-werewolves", "-dead", "-alive", "-lovers"];

let lobbies: Lobby[] = [
  { id: 1, players: [], gameStarted: false, maxPlayers: 4, chatMessages: [] },
];

interface Ability {
  name: string;
  displayName?: string;
  img: string;
  description?: string;
  conditions: {};
}

interface Player {
  name: string;
  role?: string;
  status?: string;
  abilities?: Ability[];
}

interface Lobby {
  id: number;
  createdAt?: Date;
  maxPlayers: number;
  potentialRoles?: [];
  players: Player[];
  playerHost?: number;
  gamemode?: string;
  gameStarted: boolean;
  chatMessages: [];
}

let handlePlayerClick = (a, b) => {
  console.log("this is null");
};

function getLobbyFromId(id) {
  return lobbies.find((lobby) => {
    return lobby.id === id;
  });
}

io.on("connection", (socket) => {
  socket.on("lobbyjoin", (lobbyId, playerName) => {
    let lobby = getLobbyFromId(lobbyId);
    if (lobby) {
      if (lobby.players.length < lobby.maxPlayers && !lobby.gameStarted) {
        socket.join(lobbyId);
        lobby.players.push({ name: playerName });
        io.to(lobbyId).emit("playersChanged", lobby.players);
      }

      if (lobby.players.length === lobby.maxPlayers) {
        Game(lobby);
      }

      socket.on("playerClicked", (playerClicked, playerTarget) => {
        handlePlayerClick(playerClicked, playerTarget);
      });

      socket.on("messageSent", (message, currentPlayer) => {
        io.to(lobbyId).emit("chatMessage", {
          playerId: currentPlayer.name,
          message: message,
        });
      });

      socket.on("disconnect", () => {
        const playerIndex = lobby.players.findIndex(
          (player) => player.name === playerName
        );
        lobby.players.splice(playerIndex, 1);
        io.to(lobbyId).emit("playersChanged", lobby.players);
      });
    }
  });
});

server.listen(Number(process.env.SERVER_PORT), "0.0.0.0", () => {});

function newLobby(lobbyId: Lobby["id"]) {
  lobbies.push({
    id: lobbyId,
    players: [],
    gameStarted: false,
    maxPlayers: 4,
    chatMessages: [],
  });
}

export default function Game(lobby) {
  let winner: string | null = null;
  const roles = getRoles(lobby.players.length);
  assignRoles(lobby.players, roles);
  io.to(lobby.id).emit("playersChanged", lobby.players);
  let phase = "";
  let nightTime = nightDuration;
  let discussionTime = discussionDuration;
  let votingTime = votingDuration;
  let interludeTime = interludeDuration;
  let usedAbilities: any[] = [];
  let werewolvesVotes: any[] = [];
  let lynchVotes: any[] = [];

  io.to(lobby.id).emit("gameStarted");

  function endGame(winner) {
    currentChats = ["All"];
    io.to(lobby.id).emit("winner", winner);
    // remove all abilities and end day/night cycle
    //   // 15 second timer
    //   // alert winner
  }

  function onDeath() {
    // player.abilities.map((ability) => {
    //   ability.enabled = false;
    // });

    // send death alert

    const possibleWinner = checkGameConditions(lobby.players, roles);

    winner = possibleWinner;
  }

  function handleAbilities() {
    if (phase === "Voting") {
    } else if (phase === "Night") {
    }
    lobby.players
      .filter((player) => player.status === "Alive")
      .map((player) => {
        const playerRole = roles.find((role) => {
          return role.name === player.role;
        });

        player.abilities.map((ability: any, index: any) => {
          if (
            (ability.phase === phase ||
              (ability.phase === "Day" &&
                ["Discussion", "Voting"].includes(phase))) &&
            (!ability.useLimit || ability.useLimit > 0)
          ) {
            lobby.players[
              lobby.players.findIndex((a) => a === player)
            ].abilities[index].enabled = true;
            // check other ability conditions
            // playerRole.abilities[index].useLimit -= 1;
          } else {
            lobby.players[
              lobby.players.findIndex((a) => a === player)
            ].abilities[index].enabled = false;
            // lock out ability
          }
        });
      });
  }

  function nightPhase() {
    currentChats = ["All"];
    phase = "Night";
    io.to(lobby.id).emit("phaseChange", "Night");

    function intervalFunc(countdown) {
      console.log("night...", countdown);
      nightTime = countdown;
    }

    function afterFunc(countdown) {
      const votedPlayer = getHighestVotes(werewolvesVotes);
      if (votedPlayer && votedPlayer !== -1) {
        lobby.players[votedPlayer].status = "Killed by werewolves";
        io.to(lobby.id).emit("playersChanged", lobby.players);
      }

      werewolvesVotes = [];
      io.to(lobby.id).emit("werewolvesVotesChange", []);

      const winner = checkGameConditions(lobby.players, roles);
      !winner ? interlude("Night") : endGame(winner);
    }
    createTimer(intervalFunc, afterFunc, nightDuration);
  }

  function interlude(previousPhase) {
    function intervalFunc(countdown) {
      console.log("interlude...", countdown);
      interludeTime = countdown;
    }

    function afterFunc(countdown) {
      const winner = checkGameConditions(lobby.players, roles);

      !winner
        ? previousPhase === "Night"
          ? discussion()
          : nightPhase()
        : endGame(winner);
    }
    createTimer(intervalFunc, afterFunc, interludeDuration);
  }

  function discussion() {
    currentChats = ["All"];
    phase = "Discussion";
    io.to(lobby.id).emit("phaseChange", "Discussion");

    function intervalFunc(countdown) {
      console.log("discussion...", countdown);
      discussionTime = countdown;
    }

    function afterFunc(countdown) {
      const winner = checkGameConditions(lobby.players, roles);
      !winner ? voting() : endGame(winner);
    }
    createTimer(intervalFunc, afterFunc, discussionDuration);
  }

  function getHighestVotes(votes) {
    const totalVotes = votes.map((vote) => {
      return vote.targetPlayer.name;
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
          return player.name === highestPlayerName;
        });

        return playerIndex;
      }
    }
  }

  function voting() {
    phase = "Voting";
    io.to(lobby.id).emit("phaseChange", "Voting");

    function intervalFunc(countdown) {
      console.log("voting...", countdown);
      votingTime = countdown;
    }

    function afterFunc(countdown) {
      const votedPlayer = getHighestVotes(lynchVotes);
      if (votedPlayer && votedPlayer !== -1) {
        lobby.players[votedPlayer].status = "Lynched";
        io.to(lobby.id).emit("playersChanged", lobby.players);
      }

      lynchVotes = [];
      io.to(lobby.id).emit("lynchVotesChange", []);

      const winner = checkGameConditions(lobby.players, roles);
      !winner ? interlude("Voting") : endGame(winner);
    }
    createTimer(intervalFunc, afterFunc, votingDuration);
  }

  let currentabilityUsing = null;

  function handleAbility(ability: any) {
    switch (ability.name) {
      case "Doctor Protect":
        break;

      default:
        break;
    }
  }

  function playerHasVotedBefore(votes, playerClicked) {
    return votes.findIndex((vote) => {
      return vote.playerVoting.name === playerClicked.name;
    });
  }

  handlePlayerClick = (playerClicked: any, playerTarget) => {
    if (currentabilityUsing) {
      usedAbilities.push({
        abilityName: currentabilityUsing,
        targetedPlayers: [playerTarget.name],
        usedBy: null,
      });
      currentabilityUsing = null;
    } else if (validateWerewolfVote(playerClicked, playerTarget, phase)) {
      const voteIndex = playerHasVotedBefore(werewolvesVotes, playerClicked);
      if (voteIndex !== -1) {
        werewolvesVotes[voteIndex].targetPlayer = playerTarget;
      } else {
        werewolvesVotes.push({
          playerVoting: playerClicked,
          targetPlayer: playerTarget,
        });
      }
      io.to(lobby.id).emit("werewolvesVotesChange", werewolvesVotes);
    } else if (validateLynchingVote(playerClicked, playerTarget, phase)) {
      const voteIndex = playerHasVotedBefore(lynchVotes, playerClicked);
      if (voteIndex !== -1) {
        lynchVotes[voteIndex].targetPlayer = playerTarget;
      } else {
        lynchVotes.push({
          playerVoting: playerClicked,
          targetPlayer: playerTarget,
        });
      }
      io.to(lobby.id).emit("lynchVotesChange", lynchVotes);
    }
  };

  nightPhase();
}
