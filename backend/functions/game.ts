import getRoles from "./getroles";
import assignRoles from "./assignroles";
import checkGameConditions from "./checkgameconditions";
import getHighestVotes from "./getHighestVotes";
import {
  validateAbility,
  validateLynchingVote,
  validateWerewolfVote,
} from "./validator";
import createTimer from "./createTimer";

const discussionDuration = 10;
const votingDuration = 5;
const nightDuration = 5;
const interludeDuration = 3;
let currentChats = ["Werewolves", "Medium and dead", "Lovers"];

let handlePlayerClick = (a: any, b: any) => {};

export default function Game(lobby, io, socket) {
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

  function nightPhase() {
    currentChats = ["All"];
    phase = "Night";
    io.to(lobby.id).emit("phaseChange", "Night");

    function intervalFunc(countdown) {
      console.log("night...", countdown);
      nightTime = countdown;
    }

    function afterFunc(countdown) {
      const votedPlayer = getHighestVotes(werewolvesVotes, lobby);
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

  function voting() {
    phase = "Voting";
    io.to(lobby.id).emit("phaseChange", "Voting");

    function intervalFunc(countdown) {
      console.log("voting...", countdown);
      votingTime = countdown;
    }

    function afterFunc(countdown) {
      const votedPlayer = getHighestVotes(lynchVotes, lobby);
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

  function playerHasVotedBefore(votes, playerClicked) {
    return votes.findIndex((vote) => {
      return vote.playerVoting.name === playerClicked.name;
    });
  }

  function handlePlayerClick(playerClicked: any, playerTarget) {
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
  }

  socket.on("playerClicked", (playerClicked, playerTarget) => {
    handlePlayerClick(playerClicked, playerTarget);
  });

  nightPhase();
}
