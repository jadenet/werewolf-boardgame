import { Round } from "../types";
import {
  getCenterCardIds,
  getCenterCardIndex,
  getCenterCardLabel,
  getCenterRoleId,
  isCenterCardId,
  setCenterRoleId,
} from "./center";

describe("center card helpers", () => {
  const round = { centerRoles: ["seer", "villager", "werewolf"] } as Round;

  it("creates stable ids and user-facing labels for center cards", () => {
    expect(getCenterCardIds(round)).toEqual(["center-0", "center-1", "center-2"]);
    expect(isCenterCardId("center-1")).toBe(true);
    expect(isCenterCardId("player-1")).toBe(false);
    expect(getCenterCardIndex("center-2")).toBe(2);
    expect(getCenterCardLabel("center-2")).toBe("Center Card 3");
  });

  it("reads and updates the role assigned to a center card", () => {
    expect(getCenterRoleId(round, "center-0")).toBe("seer");
    setCenterRoleId(round, "center-0", "robber");
    expect(getCenterRoleId(round, "center-0")).toBe("robber");
  });
});