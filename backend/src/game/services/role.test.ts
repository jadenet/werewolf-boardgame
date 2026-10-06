import { faker } from "@faker-js/faker";
import {
  assignRoles,
  buildDefaultRoles,
  getPlayersByRole,
  getPlayersByTeam,
  getRequiredRoleCount,
  getRoleByIdentifier,
} from "./role";

describe("role services", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test.each([0, 1, 4, 8])("requires three center roles for %i players", (playerCount) => {
    expect(getRequiredRoleCount(playerCount)).toBe(playerCount + 3);
  });

  it("builds a default role set with enough roles for the players and center", () => {
    expect(buildDefaultRoles(2)).toHaveLength(5);
    expect(buildDefaultRoles(2)).toEqual([
      "werewolf",
      "werewolf",
      "seer",
      "robber",
      "troublemaker",
    ]);
    expect(buildDefaultRoles(20)).toHaveLength(23);
    expect(buildDefaultRoles(20).slice(-8)).toEqual(Array(8).fill("villager"));
  });

  it("deals one role per player and keeps exactly three center roles", () => {
    jest.spyOn(faker.helpers, "shuffle").mockImplementation((items) => items);

    const { playerRoles, centerRoles } = assignRoles(["p1", "p2"], ["seer"]);

    expect(playerRoles).toEqual(new Map([["p1", ["seer"]], ["p2", ["villager"]]]));
    expect(centerRoles).toEqual(["villager", "villager", "villager"]);
    expect(faker.helpers.shuffle).toHaveBeenCalledTimes(1);
  });

  it("looks up role identifiers by id or name without case sensitivity", () => {
    expect(getRoleByIdentifier("WEREWOLF")?.id).toBe("werewolf");
    expect(getRoleByIdentifier("Seer")?.id).toBe("seer");
    expect(getRoleByIdentifier(undefined)).toBeUndefined();
    expect(getRoleByIdentifier("unknown")).toBeUndefined();
  });

  it("finds players by role and team", () => {
    const roles = new Map([
      ["p1", ["werewolf"]],
      ["p2", ["seer"]],
      ["p3", ["minion"]],
    ]);

    expect(getPlayersByRole(roles, "wolf")).toEqual([]);
    expect(getPlayersByRole(roles, "werewolf")).toEqual(["p1"]);
    expect(getPlayersByTeam(roles, "Werewolves")).toEqual(["p1", "p3"]);
    expect(getPlayersByTeam(roles, "Villagers")).toEqual(["p2"]);
  });
});