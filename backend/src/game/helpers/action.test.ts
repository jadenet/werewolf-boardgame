import ViewRole from "../actions/viewRole";
import { getAbilityById, getAbilityByName, getActionFunctionByName, getPlayersByAbility } from "./action";

describe("game action helpers", () => {
  it("finds players whose current roles own an ability", () => {
    const playerRoles = new Map([
      ["seer", ["seer"]],
      ["robber", ["robber"]],
      ["villager", ["villager"]],
    ]);

    expect(getPlayersByAbility(playerRoles, "seer-ability")).toEqual(["seer"]);
    expect(getPlayersByAbility(playerRoles, "missing-ability")).toEqual([]);
  });

  it("looks up ability metadata by id and name", () => {
    expect(getAbilityById("seer-ability")?.name).toBe("Seer Ability");
    expect(getAbilityByName("Seer Ability")?.id).toBe("seer-ability");
    expect(getAbilityById("missing-ability")).toBeUndefined();
  });

  it("resolves registered actions and rejects unknown names", () => {
    expect(getActionFunctionByName("ViewRole")).toBe(ViewRole);
    expect(() => getActionFunctionByName("UnknownAction")).toThrow("No function found for action name: UnknownAction");
  });
});