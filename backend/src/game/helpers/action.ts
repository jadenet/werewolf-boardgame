import { Ability, Player, Role } from "../types";
import allAbilities from "../../assets/abilities.json";
import { getRoleById } from "../services/role";
import SwitchRoles from "../actions/switchRoles";
import ViewAllOfRole from "../actions/viewAllOfRole";
import ViewRole from "../actions/viewRole";
import ViewTeam from "../actions/viewTeam";

export function getPlayersByAbility(
  playerRoles: Map<Player["id"], Role["id"][]>,
  ability: Ability["id"],
) {
  const players: Player["id"][] = [];

  playerRoles.forEach((roleIds: Role["id"][], playerId: Player["id"]) => {
    roleIds.forEach((roleId: Role["id"]) => {
      const role = getRoleById(roleId);
      if (role && role.abilities.includes(ability)) {
        players.push(playerId);
      }
    });
  });

  return players;
}

export function getAbilityById(abilityId: Ability["id"]) {
  return allAbilities.find((ability) => {
    return ability.id === abilityId;
  }) as Ability;
}

export function getAbilityByName(abilityName: Ability["name"]) {
  return allAbilities.find((ability) => {
    return ability.name === abilityName;
  }) as Ability;
}

const actions: Map<string, Function> = new Map<string, Function>([
  ["ViewRole", ViewRole],
  ["ViewTeam", ViewTeam],
  ["ViewAllOfRole", ViewAllOfRole],
  ["SwitchRoles", SwitchRoles],
]);

export function getActionFunctionByName(name: string) {
  const func = actions.get(name);

  if (!func) {
    throw new Error(`No function found for action name: ${name}`);
  }

  return func;
}
