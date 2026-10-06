import getTeamWinners from "./getTeamWinners";
import { PlayerStatus } from "../types";

describe("getTeamWinners", () => {
  it("awards villagers a win when a werewolf is eliminated", () => {
    const roles = new Map([["wolf", ["werewolf"]], ["seer", ["seer"]]]);
    const status = new Map<string, PlayerStatus>([["wolf", "Alive"], ["seer", "Alive"]]);

    const winners = getTeamWinners(new Map([["seer", "wolf"]]), roles, status);

    expect(winners).toEqual(["Villagers"]);
    expect(status.get("wolf")).toBe("Dead");
  });

  it("awards werewolves a win when no werewolf is eliminated", () => {
    const roles = new Map([["wolf", ["werewolf"]], ["seer", ["seer"]]]);
    const status = new Map<string, PlayerStatus>([["wolf", "Alive"], ["seer", "Alive"]]);

    expect(getTeamWinners(new Map([["wolf", "seer"]]), roles, status)).toEqual(["Werewolves"]);
  });

  it("awards villagers a win when the game has no werewolves", () => {
    const roles = new Map([["seer", ["seer"]], ["villager", ["villager"]]]);
    const status = new Map<string, PlayerStatus>([["seer", "Alive"], ["villager", "Alive"]]);

    expect(getTeamWinners(new Map(), roles, status)).toEqual(["Villagers"]);
  });

  it("awards the Tanner a solo win when eliminated", () => {
    const roles = new Map([["tanner", ["tanner"]], ["wolf", ["werewolf"]]]);
    const status = new Map<string, PlayerStatus>([["tanner", "Alive"], ["wolf", "Alive"]]);

    expect(getTeamWinners(new Map([["wolf", "tanner"]]), roles, status)).toEqual(["Solo"]);
  });

  it("eliminates the Hunter's vote target when the Hunter is eliminated", () => {
    const roles = new Map([["hunter", ["hunter"]], ["wolf", ["werewolf"]], ["seer", ["seer"]]]);
    const status = new Map<string, PlayerStatus>([["hunter", "Alive"], ["wolf", "Alive"], ["seer", "Alive"]]);
    const votes = new Map([["wolf", "hunter"], ["seer", "hunter"], ["hunter", "wolf"]]);

    expect(getTeamWinners(votes, roles, status)).toEqual(["Villagers"]);
    expect(status.get("hunter")).toBe("Dead");
    expect(status.get("wolf")).toBe("Dead");
  });

  it("does not eliminate anyone on a tie", () => {
    const roles = new Map([["wolf", ["werewolf"]], ["seer", ["seer"]]]);
    const status = new Map<string, PlayerStatus>([["wolf", "Alive"], ["seer", "Alive"]]);

    expect(getTeamWinners(new Map([["wolf", "seer"], ["seer", "wolf"]]), roles, status)).toEqual(["Werewolves"]);
    expect(status.get("wolf")).toBe("Alive");
    expect(status.get("seer")).toBe("Alive");
  });
});