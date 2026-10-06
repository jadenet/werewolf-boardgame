import getVotesOnPlayerId from "./getVotesOnPlayerId";

describe("getVotesOnPlayerId", () => {
  it("counts votes by their target, not by voter", () => {
    const votes = new Map([
      ["p1", "p3"],
      ["p2", "p3"],
      ["p3", "p1"],
    ]);

    expect(getVotesOnPlayerId(votes, "p3")).toBe(2);
    expect(getVotesOnPlayerId(votes, "p1")).toBe(1);
  });

  it("returns zero when nobody voted for the player", () => {
    expect(getVotesOnPlayerId(new Map([["p1", "p2"]]), "p3")).toBe(0);
  });
});