import { getWinnerAnnouncement } from "./getWinnerAnnouncement";

describe("getWinnerAnnouncement", () => {
  it("uses singular wins for the solo Tanner team", () => {
    expect(getWinnerAnnouncement(["Solo"])).toBe("The Tanner wins!");
  });

  it("uses plural team labels and win for village or werewolf victories", () => {
    expect(getWinnerAnnouncement(["Villagers"])).toBe("The Villagers win!");
    expect(getWinnerAnnouncement(["Werewolves"])).toBe("The Werewolves win!");
  });

  it("joins multiple winning teams", () => {
    expect(getWinnerAnnouncement(["Solo", "Werewolves"])).toBe("The Tanner & The Werewolves win!");
  });

  it("returns null when there is no winner", () => {
    expect(getWinnerAnnouncement(null)).toBeNull();
    expect(getWinnerAnnouncement(undefined)).toBeNull();
    expect(getWinnerAnnouncement([])).toBeNull();
  });
});