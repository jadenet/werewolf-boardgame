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
const io = new Server(server);
const port = 3000;

const rooms = ["-all", "-werewolves", "-dead", "-alive", "-lovers"];

let lobbies: Lobby[] = [
  { id: 1, players: [], gameStarted: false, maxPlayers: 4 },
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
  players: Player[];
  playerHost?: number;
  gamemode?: string;
  gameStarted: boolean;
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

function newLobby(lobbyId: Lobby["id"]) {
  lobbies.push({ id: lobbyId, players: [], gameStarted: false, maxPlayers: 4 });
}

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

export default function Game(lobby) {
  let winner: string | null = null;
  const roles = getRoles(lobby.players.length);
  assignRoles(lobby.players, roles);
  io.to(lobby.id).emit("playersChanged", lobby.players);
  let phase = "Night";
  let nightTime = nightDuration;
  let discussionTime = discussionDuration;
  let votingTime = votingDuration;
  let interludeTime = interludeDuration;
  let usedAbilities: any[] = [];
  let werewolvesVotes: any[] = [];
  let lynchVotes: any[] = [];

  function endGame() {
    currentChats = ["All"];
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

    function intervalFunc(countdown) {
      console.log("night...", countdown);
      nightTime = countdown;
    }

    function afterFunc(countdown) {
      const totalWerewolfVotes = werewolvesVotes.map((vote) => {
        return vote.targetPlayer.name;
      });

      if (totalWerewolfVotes.length > 0) {
        let frequencies = {};
        for (const vote of totalWerewolfVotes) {
          frequencies[vote] = frequencies[vote] ? frequencies[vote] + 1 : 1;
        }

        let highestVotesNumber = 0;
        let highestPlayerName = "";

        for (const key in frequencies) {
          highestVotesNumber =
            frequencies[key] > highestVotesNumber ? frequencies[key] : 0;
          highestPlayerName = key;
        }

        const playerIndex = lobby.players.findIndex(
          (player) => player.name === highestPlayerName
        );
        lobby.players[playerIndex].status = "Killed by werewolves";
        io.to(lobby.id).emit("playersChanged", lobby.players);

      }
      !checkGameConditions(lobby.players, roles) && interlude1();
    }
    createTimer(intervalFunc, afterFunc, nightDuration);
  }

  function interlude1() {
    function intervalFunc(countdown) {
      console.log("interlude...", countdown);
      interludeTime = countdown;
    }

    function afterFunc(countdown) {
      !checkGameConditions(lobby.players, roles) && discussion();
    }
    createTimer(intervalFunc, afterFunc, interludeDuration);
  }

  function discussion() {
    currentChats = ["All"];

    function intervalFunc(countdown) {
      console.log("discussion...", countdown);
      discussionTime = countdown;
    }

    function afterFunc(countdown) {
      !checkGameConditions(lobby.players, roles) && voting();
    }
    createTimer(intervalFunc, afterFunc, discussionDuration);
  }

  function voting() {
    function intervalFunc(countdown) {
      console.log("voting...", countdown);
      votingTime = countdown;
    }

    function afterFunc(countdown) {
      !checkGameConditions(lobby.players, roles) && interlude2();
    }
    createTimer(intervalFunc, afterFunc, votingDuration);
  }

  function interlude2() {
    function intervalFunc(countdown) {
      console.log("interlude2...", countdown);
      interludeTime = countdown;
    }

    function afterFunc(countdown) {
      !checkGameConditions(lobby.players, roles) && nightPhase();
    }
    createTimer(intervalFunc, afterFunc, interludeDuration);
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

  handlePlayerClick = (playerClicked: any, playerTarget) => {
    if (currentabilityUsing) {
      usedAbilities.push({
        abilityName: currentabilityUsing,
        targetedPlayers: [playerTarget.name],
        usedBy: null,
      });
      currentabilityUsing = null;
    } else if (
      phase === "Night" &&
      validateWerewolfVote(playerClicked, playerTarget)
    ) {
      werewolvesVotes.push({
        playerVoting: playerClicked,
        targetPlayer: playerTarget,
      });
    } else if (
      phase === "Voting" &&
      validateLynchingVote(playerClicked, playerTarget)
    ) {
      lynchVotes.push({
        playerVoting: playerClicked,
        targetPlayer: playerTarget,
      });
    }
  };

  nightPhase();
}
