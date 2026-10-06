import getHighestVotes from "./getHighestVotes";

describe("getHighestVotes", () => {
  it("returns every player tied for the most votes", () => {
    expect(getHighestVotes(new Map([
      ["voter1", "target1"],
      ["voter2", "target2"],
      ["voter3", "target1"],
      ["voter4", "target2"],
      ["voter5", "target3"],
    ]))).toEqual(["target1", "target2"]);
  });

  it("returns the sole highest-voted player", () => {
    expect(getHighestVotes(new Map([
      ["voter1", "target1"],
      ["voter2", "target1"],
      ["voter3", "target2"],
    ]))).toEqual(["target1"]);
  });

  it("returns no targets when there are no votes", () => {
    expect(getHighestVotes(new Map())).toEqual([]);
  });
});