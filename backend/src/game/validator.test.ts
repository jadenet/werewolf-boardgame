import { Ability, PlayerStatus, RoundStatus } from "./types";
import { validateAbility, validateDiscussionSkip, validateLynchingVote } from "./validator";

const seerAbility: Ability = {
  id: "seer-ability",
  name: "Seer Ability",
  description: "",
  optional: true,
  actions: [],
  conditions: { phase: "Night", queue: 8, playerStatus: "Alive" },
};

describe("game validators", () => {
  it("allows one discussion skip per player", () => {
    expect(validateDiscussionSkip(["p1"], "p2")).toBe(true);
    expect(validateDiscussionSkip(["p1"], "p1")).toBe(false);
  });

  it("accepts only non-self votes during voting", () => {
    expect(validateLynchingVote("p1", "p2", "Voting")).toBe(true);
    expect(validateLynchingVote("p1", "p1", "Voting")).toBe(false);
    expect(validateLynchingVote("p1", "p2", "Discussion")).toBe(false);
  });

  it("allows an owned ability when all configured conditions match", () => {
    const result = validateAbility(
      "seer",
      new Map([["seer", ["seer"]]]),
      new Map([["seer", "Alive" as PlayerStatus]]),
      seerAbility,
      "Night" as RoundStatus,
      8,
    );

    expect(result.success).toBe(true);
    expect(result.message).toBe("");
  });

  it("rejects abilities the player's role does not own", () => {
    const result = validateAbility("villager", new Map([["villager", ["villager"]]]), new Map(), seerAbility, "Night", 8);

    expect(result.success).toBe(false);
    expect(result.message).toBe("You do not have access to this ability!");
  });

  it.each([
    ["Discussion", 8, "Alive"],
    ["Night", 7, "Alive"],
    ["Night", 8, "Dead"],
  ] as const)("rejects an owned ability when phase, queue, or status is wrong", (phase, queue, status) => {
    const result = validateAbility(
      "seer",
      new Map([["seer", ["seer"]]]),
      new Map([["seer", status]]),
      seerAbility,
      phase,
      queue,
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe("You cannot play this ability yet!");
  });

  it("requires a sole werewolf for the lone-wolf ability condition", () => {
    const loneWolfAbility: Ability = {
      ...seerAbility,
      id: "lone-wolf-ability",
      conditions: { other: "SoleWerewolf" },
    };
    const roles = new Map([["wolf1", ["werewolf"]], ["wolf2", ["werewolf"]]]);
    const status = new Map<string, PlayerStatus>([["wolf1", "Alive"], ["wolf2", "Alive"]]);

    const result = validateAbility("wolf1", roles, status, loneWolfAbility, "Night", 1);

    expect(result.success).toBe(false);
    expect(result.message).toBe("You cannot play this ability yet!");
  });
});