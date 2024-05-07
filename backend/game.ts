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
const playerCount = 16;
let currentChats = ["Werewolves", "Medium and dead", "Lovers"];

import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { faker } from "@faker-js/faker";
const app = express();
const server = createServer(app);
const io = new Server(server);
const port = 3000;

const rooms = ["-all", "-werewolves", "-dead", "-alive", "-lovers"];

const randomPlayers: any = [];

for (let index = 0; index < 2; index++) {
  randomPlayers.push({
    name: faker.internet.userName(),
  });
}

let lobbies: lobby[] = [
  { id: 1, players: randomPlayers, gameStarted: false, max_players: 4 },
];

interface ability {
  name: string;
  displayName?: string;
  img: string;
  description?: string;
  conditions: {};
}

interface player {
  name: string;
  role?: string;
  status?: string;
  abilities?: ability[];
}

interface lobby {
  id: number;
  createdAt?: Date;
  max_players: number;
  players: player[];
  playerHost?: number;
  gamemode?: string;
  gameStarted: boolean;
}

function getLobbyFromId(id) {
  return lobbies.find((lobby) => {
    return lobby.id === id;
  });
}

io.on("connection", (socket) => {
  socket.on("lobbyjoin", (lobbyId, playerName) => {
    let lobby = getLobbyFromId(lobbyId);
    if (lobby) {
      const playerLength = lobby.players.length;
      if (playerLength < lobby.max_players && !lobby.gameStarted) {
        socket.join(lobbyId);
        lobby.players.push({ name: playerName });
        io.to(lobbyId).emit("playersChanged", lobby.players)
      }
      
      if (playerLength === lobby.max_players) {
        Game(lobby);
      }

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

function newLobby(lobbyId: lobby["id"]) {
  lobbies.push({ id: lobbyId, players: [], gameStarted: false });
}

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

export default function Game(lobby) {
  console.log("START GAME")
  let winner: string | null = null;
  const roles = getRoles(playerCount);
  assignRoles(players, roles);
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

    const possibleWinner = checkGameConditions(players, roles);

    winner = possibleWinner;
  }

  function handleAbilities() {
    if (phase === "Voting") {
    } else if (phase === "Night") {
    }
    players
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
            players[players.findIndex((a) => a === player)].abilities[
              index
            ].enabled = true;
            // check other ability conditions
            // playerRole.abilities[index].useLimit -= 1;
          } else {
            players[players.findIndex((a) => a === player)].abilities[
              index
            ].enabled = false;
            // lock out ability
          }
        });
      });
  }

  function nightPhase() {
    currentChats = ["All"];

    function intervalFunc(countdown) {
      nightTime = countdown;
    }

    function afterFunc(countdown) {
      !checkGameConditions(players, roles) && interlude1();
    }
    createTimer(intervalFunc, afterFunc, nightDuration);
  }

  function interlude1() {
    function intervalFunc(countdown) {
      interludeTime = countdown;
    }

    function afterFunc(countdown) {
      !checkGameConditions(players, roles) && discussion();
    }
    createTimer(intervalFunc, afterFunc, interludeDuration);
  }

  function discussion() {
    currentChats = ["All"];

    function intervalFunc(countdown) {
      discussionTime = countdown;
    }

    function afterFunc(countdown) {
      !checkGameConditions(players, roles) && voting();
    }
    createTimer(intervalFunc, afterFunc, discussionDuration);
  }

  function voting() {
    function intervalFunc(countdown) {
      votingTime = countdown;
    }

    function afterFunc(countdown) {
      !checkGameConditions(players, roles) && interlude2();
    }
    createTimer(intervalFunc, afterFunc, votingDuration);
  }

  function interlude2() {
    function intervalFunc(countdown) {
      interludeTime = countdown;
    }

    function afterFunc(countdown) {
      !checkGameConditions(players, roles) && nightPhase();
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

  function handlePlayerClick(player: any) {
    const playerClicked = player;
    if (currentabilityUsing) {
      usedAbilities.push({
        abilityName: currentabilityUsing,
        targetedPlayers: [player.name],
        usedBy: null,
      });
      currentabilityUsing = null;
    } else if (
      phase === "Night" &&
      validateWerewolfVote(playerClicked, player)
    ) {
      werewolvesVotes.push({
        playerVoting: playerClicked,
        targetPlayer: player,
      });
    } else if (
      phase === "Voting" &&
      validateLynchingVote(playerClicked, player)
    ) {
      lynchVotes.push({ playerVoting: playerClicked, targetPlayer: player });
    }
  }
}
