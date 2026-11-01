import { addPlayer } from "../lobby/lobby";
import { switchRoles } from "../game/actions/switchRoles";
import { Round } from "../game/types";
import { buildRoundPlayerRows, getRecentRounds, saveRound, snapshotStartingRoles } from "./gameHistory";

function buildRound(): Round {
  return {
    id: "round-1",
    createdAt: Date.now(),
    playerRoles: new Map([
      ["history-wolf", ["werewolf"]],
      ["history-seer", ["seer"]],
      ["history-bot", ["robber"]],
    ]),
    playerStatus: new Map([
      ["history-wolf", "Alive"],
      ["history-seer", "Alive"],
      ["history-bot", "Alive"],
    ]),
    centerRoles: ["villager", "villager", "troublemaker"],
    status: "PreGame",
    options: {
      discussionDuration: 1,
      votingDuration: 1,
      actionDuration: 1,
      resultsDuration: 1,
      preGameDuration: 1,
    },
  };
}

describe("game history", () => {
  beforeAll(() => {
    addPlayer({ id: "history-wolf", name: "Wolf" });
    addPlayer({ id: "history-seer", name: "Seer" });
    addPlayer({ id: "history-bot", name: "Bot Owen", isBot: true });
  });

  it("keeps starting roles separate from roles changed during the night", () => {
    const round = buildRound();
    const startingRoles = snapshotStartingRoles(round);

    // Robber (the bot) steals the werewolf card; a center card also changes.
    switchRoles("history-bot", "history-wolf", round.playerRoles);
    round.centerRoles[0] = "drunk";

    round.votes = new Map([
      ["history-wolf", "history-bot"],
      ["history-seer", "history-bot"],
      ["history-bot", "history-seer"],
    ]);
    round.playerStatus.set("history-bot", "Dead");
    round.teamWinner = ["Villagers"];

    const rows = buildRoundPlayerRows(round, startingRoles);

    expect(startingRoles.centerRoles).toEqual(["villager", "villager", "troublemaker"]);
    expect(rows).toEqual([
      {
        playerId: "history-wolf",
        playerName: "Wolf",
        isBot: false,
        startingRole: "werewolf",
        finalRole: "robber",
        status: "Alive",
        votedFor: "history-bot",
        isWinner: true,
      },
      {
        playerId: "history-seer",
        playerName: "Seer",
        isBot: false,
        startingRole: "seer",
        finalRole: "seer",
        status: "Alive",
        votedFor: "history-bot",
        isWinner: true,
      },
      {
        playerId: "history-bot",
        playerName: "Bot Owen",
        isBot: true,
        startingRole: "robber",
        finalRole: "werewolf",
        status: "Dead",
        votedFor: "history-seer",
        isWinner: false,
      },
    ]);
  });

  it("is a no-op when no database is configured", async () => {
    const round = buildRound();
    const lobby = { id: "lobby-1", players: [], gameStarted: false, rounds: [round], selectedRoleIds: [] };

    await expect(saveRound(lobby, round, snapshotStartingRoles(round))).resolves.toBeUndefined();
    await expect(getRecentRounds(20)).resolves.toEqual([]);
  });
});
