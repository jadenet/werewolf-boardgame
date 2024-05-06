"use client";

import getRoles from "../components/game/getroles";
import assignRoles from "../components/game/assignroles";
import { useEffect, useMemo, useState } from "react";
import createPlayers from "../components/game/createplayers";
import checkGameConditions from "../components/game/checkgameconditions";
import {
  validateAbility,
  validateLynchingVote,
  validateWerewolfVote,
} from "../components/game/validator";

const discussionDuration = 10;
const votingDuration = 5;
const nightDuration = 5;
const interludeDuration = 3;
let currentChats = ["Werewolves", "Medium and dead", "Lovers"];

export default function Game() {
  const [winner, setWinner]: [string | null, any] = useState(null);
  const roles = useMemo(() => getRoles(16), []);
  const [players, setPlayers]: [any[], any] = useState(
    assignRoles(createPlayers(16), roles)
  );

  const [phase, setPhase] = useState("Night");
  const [nightTime, setNightTime] = useState(nightDuration);
  const [discussionTime, setDiscussionTime] = useState(discussionDuration);
  const [votingTime, setVotingTime] = useState(votingDuration);
  const [interludeTime, setInterludeTime] = useState(interludeDuration);
  const [usedAbilities, setUsedAbilities]: [any[], any] = useState([]);
  const [werewolvesVotes, setWerewovlesVotes]: [any[], any] = useState([]);
  const [lynchVotes, setLynchVotes]: [any[], any] = useState([]);

  const [
    alivePlayers,
    deadPlayers,
    aliveVillagers,
    aliveWerewolves,
    fool,
    headhunter,
    aliveLoveCouple,
    aliveSoloKillers,
  ] = useMemo(
    () => [
      players.filter((player) => player.status === "Alive"),
      players.filter((player) => player.status !== "Alive"),
      players.filter(
        (player) => player.status === "Alive" && player.team.includes("Village")
      ),
      players.filter(
        (player) =>
          player.status === "Alive" && player.team.includes("Werewolves")
      ),
      players.find((player) => player.role === "Fool"),
      players.find((player) => player.role === "Headhunter"),
      players.filter(
        (player) =>
          player.status === "Alive" && player.team.includes("Love Couple")
      ),
      players.filter(
        (player) =>
          player.status === "Alive" &&
          player.team.includes("Solo") &&
          roles[roles.findIndex((role) => player.role === role.name)]
            .assignment === "Killing"
      ),
    ],
    [players]
  );

  function endGame() {}

  useEffect(() => {
    // player.abilities.map((ability) => {
    //   ability.enabled = false;
    // });

    // send death alert

    const possibleWinner = checkGameConditions(
      alivePlayers,
      aliveVillagers,
      aliveWerewolves,
      headhunter,
      fool,
      aliveSoloKillers,
      aliveLoveCouple
    );

    possibleWinner && setWinner(possibleWinner);
  }, [players]);

  useEffect(() => {
    endGame();
  }, [winner]);

  useEffect(() => {
    if (currentChats.includes("All")) {
    } else if (currentChats.includes("Werewolves")) {
    } else if (currentChats.includes("Medium and dead")) {
    } else if (currentChats.includes("Lovers")) {
    }
  }, [currentChats]);

  useEffect(() => {
    if (phase === "Voting") {
    } else if (phase === "Night") {
    }
    alivePlayers.map((player) => {
      const playerRole = roles.find((role) => {
        return role.name === player.role;
      });

      player.abilities.map((ability:any , index: any) => {
        if (
          (ability.phase === phase ||
            (ability.phase === "Day" &&
              ["Discussion", "Voting"].includes(phase))) &&
          (!ability.useLimit || ability.useLimit > 0)
        ) {
          players[players.findIndex((a) => a === player)].abilities[
            index
          ].enabled = true;
          setPlayers([...players]);
          // check other ability conditions
          // playerRole.abilities[index].useLimit -= 1;
        } else {
          players[players.findIndex((a) => a === player)].abilities[
            index
          ].enabled = false;
          setPlayers([...players]);
          // lock out ability
        }
      });
    });
  }, [phase]);

  useEffect(() => {
    let timeout: any;
    if (!winner) {
      if (phase === "Night") {
        currentChats = ["All"];
        if (nightTime > 0) {
          timeout = setTimeout(() => {
            setNightTime(nightTime - 1);
            if (nightTime === 1) {
              setPhase("Interlude1");
            }
          }, 1000);
        } else {
          setNightTime(nightDuration);
        }

        return () => {
          clearTimeout(timeout);
        };
      } else if (phase === "Interlude1") {
        if (interludeTime > 0) {
          timeout = setTimeout(() => {
            setInterludeTime(interludeTime - 1);
            if (interludeTime === 1) {
              setPhase("Discussion");
            }
          }, 1000);
        } else {
          setInterludeTime(interludeDuration);
        }

        return () => {
          clearTimeout(timeout);
        };
      } else if (phase === "Interlude2") {
        if (interludeTime > 0) {
          timeout = setTimeout(() => {
            setInterludeTime(interludeTime - 1);
            if (interludeTime === 1) {
              setPhase("Night");
            }
          }, 1000);
        } else {
          setInterludeTime(interludeDuration);
        }

        return () => {
          clearTimeout(timeout);
        };
      } else if (phase === "Discussion") {
        currentChats = ["All"];

        if (discussionTime > 0) {
          timeout = setTimeout(() => {
            setDiscussionTime(discussionTime - 1);
            if (discussionTime === 1) {
              setPhase("Voting");
            }
          }, 1000);
        } else {
          setDiscussionTime(discussionDuration);
        }

        return () => {
          clearTimeout(timeout);
        };
      } else if (phase === "Voting") {
        if (votingTime > 0) {
          timeout = setTimeout(() => {
            setVotingTime(votingTime - 1);
            if (votingTime === 1) {
              setPhase("Interlude2");
            }
          }, 1000);
        } else {
          setVotingTime(votingDuration);
        }

        return () => {
          clearTimeout(timeout);
        };
      } else if (phase === "GameEnd") {
        currentChats = ["All"];
        // remove all abilities and end day/night cycle
        //   // 15 second timer
        //   // alert winner
      }
    } else {
      clearTimeout(timeout);
    }
  }, [phase, nightTime, discussionTime, votingTime, interludeTime, winner]);

  const [currentabilityUsing, setCurrentAbilityUsing]: [string | null, any] =
    useState(null);

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
      setUsedAbilities(usedAbilities);
      setCurrentAbilityUsing(null);
    } else if (
      phase === "Night" &&
      validateWerewolfVote(playerClicked, player)
    ) {
      werewolvesVotes.push({
        playerVoting: playerClicked,
        targetPlayer: player,
      });
      setWerewovlesVotes(werewolvesVotes);
    } else if (
      phase === "Voting" &&
      validateLynchingVote(playerClicked, player)
    ) {
      lynchVotes.push({ playerVoting: playerClicked, targetPlayer: player });
      setLynchVotes(lynchVotes);
    }
    //   if (player.effects.includes("Doctor Protect")) {
    //     players[players.findIndex((a) => a === player)].effects.splice(
    //       player.effects.indexOf("Doctor Protect"),
    //       1
    //     );
    //     setPlayers([...players]);
    //   } else {
    //     if (player.status === "Alive") {
    //       players[players.findIndex((a) => a === player)].status = "Lynched";
    //       setPlayers([...players]);
    //     }
    //   }
  }

  return (
    <>
      <div className="w-full mx-96 font-bold text-2xl">
        {!winner
          ? (phase === "Night" && `night: ${nightTime}`) ||
            (phase === "Discussion" && `discussion: ${discussionTime}`) ||
            (phase === "Voting" && `voting: ${votingTime}`) ||
            (phase == "Interlude1" && "Interlude1") ||
            (phase == "Interlude2" && "Interlude2")
          : `Winner: ${winner || "No winner"}`}
      </div>
      <div className="flex flex-col">
        {usedAbilities.map((ability) => {
          return (
            <div>
              {ability.abilityName} {ability.targetedPlayers}{" "}
              {ability.usedBy || "no one"}
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-4 gap-1 mx-96">
        {players.map((player) => {
          const playerRole = roles.find((role) => {
            return role.name === player.role;
          });
          return (
            <>
              <p
                onClick={() => {
                  handlePlayerClick(player);
                }}
              >
                {player.name}
              </p>
              <p>{player.status}</p>
              <div className="flex gap-1 items-center">
                <img
                  className="w-8"
                  src={`/Role_Images/${playerRole && playerRole.img}`}
                  alt={player.name}
                />
                <p>{player.role}</p>
              </div>
              <div>
                {player.abilities.map((ability: any) => {
                  return (
                    <button
                      className={`btn btn-sm btn-outline ${
                        !ability.enabled && "btn-disabled"
                      }`}
                      onClick={() => {
                        setCurrentAbilityUsing(ability.name);
                      }}
                    >
                      {ability.displayName || ability.name}
                    </button>
                  );
                })}
              </div>
            </>
          );
        })}
      </div>
    </>
  );
}
