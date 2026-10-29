import { faker } from "@faker-js/faker";
import { assignRoles, buildDefaultRoles } from "./role";

describe("assignRoles", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("deals each player one role and leaves three roles in the center", () => {
    const players = ["p1", "p2", "p3", "p4", "p5", "p6"];
    const selectedRoles = [
      "werewolf",
      "werewolf",
      "seer",
      "robber",
      "troublemaker",
      "villager",
      "villager",
      "villager",
      "insomniac",
    ];

    const { playerRoles, centerRoles } = assignRoles(players, selectedRoles);

    expect([...playerRoles.keys()]).toEqual(players);
    players.forEach((player) => {
      expect(playerRoles.get(player)).toHaveLength(1);
    });
    expect(centerRoles).toHaveLength(3);
    expect([...playerRoles.values()].flat().concat(centerRoles).sort()).toEqual(
      [...selectedRoles].sort()
    );
    expect(selectedRoles).toHaveLength(9);
  });

  it("pads a short selection with villagers instead of rejecting it", () => {
    jest.spyOn(faker.helpers, "shuffle").mockImplementation((items) => items);

    const selectedRoles = ["seer", "robber"];
    const { playerRoles, centerRoles } = assignRoles(["p1", "p2"], selectedRoles);

    expect(playerRoles).toEqual(new Map([["p1", ["seer"]], ["p2", ["robber"]]]));
    expect(centerRoles).toEqual(["villager", "villager", "villager"]);
    expect(selectedRoles).toEqual(["seer", "robber"]);
  });

  it("deals only the required number of roles from a longer selection", () => {
    jest.spyOn(faker.helpers, "shuffle").mockImplementation((items) => items);

    const { playerRoles, centerRoles } = assignRoles(
      ["p1"],
      ["seer", "robber", "villager", "werewolf", "mason"]
    );

    expect(playerRoles).toEqual(new Map([["p1", ["seer"]]]));
    expect(centerRoles).toEqual(["robber", "villager", "werewolf"]);
  });

  it("uses default roles when the selection is empty", () => {
    jest.spyOn(faker.helpers, "shuffle").mockImplementation((items) => items);

    const { playerRoles, centerRoles } = assignRoles(["p1"], []);

    expect([...playerRoles.values()].flat().concat(centerRoles)).toEqual(buildDefaultRoles(1));
  });
});
