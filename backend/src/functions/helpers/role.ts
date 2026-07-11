import { faker } from "@faker-js/faker";
import { Player, Role, Team } from "../types";
import roles from "../../assets/roles.json";

const rolesList = ["werewolf", "werewolf", "seer", "villager", "villager", "villager"];

export function assignRoles(players: Player["id"][], roles: Role["id"][] = rolesList) {
  const rolesPool = [...roles];
  const assignedRoles = new Map<Player["id"], Role["id"][]>();

  players.map((playerId: Player["id"]) => {
    const role = faker.helpers.arrayElement(rolesPool);
    assignedRoles.set(playerId, [role]);

    rolesPool.splice(rolesPool.indexOf(role), 1);
  });

  return assignedRoles;
}

export function getRoleById(id: Role["id"] | undefined) {
  const foundRole = roles.find((role) => {
    return role.id === id;
  });

  return foundRole;
}

export function getRoleByIdentifier(identifier: string | undefined) {
  if (!identifier) {
    return undefined;
  }

  const normalizedIdentifier = identifier.toLowerCase();
  return roles.find((role) => {
    return role.id.toLowerCase() === normalizedIdentifier || role.name.toLowerCase() === normalizedIdentifier;
  });
}

export function getPlayersByRole(
  playerRoles: Map<Player["id"], Role["id"][]>,
  roleIdentifier: string,
) {
  const players: Player["id"][] = [];
  const matchingRole = getRoleByIdentifier(roleIdentifier);
  if (!matchingRole) {
    return players;
  }

  playerRoles.forEach((playerRole, playerId) => {
    if (playerRole.includes(matchingRole.id)) {
      players.push(playerId);
    }
  });
  return players;
}

export function getPlayersByTeam(
  playerRoles: Map<Player["id"], Role["id"][]>,
  team: Team,
) {
  const players: Player["id"][] = [];
  playerRoles.forEach((playerRole, playerId) => {
    const currentRole = getRoleById(playerRole[0]);
    if (currentRole?.team === team) {
      players.push(playerId);
    }
  });
  return players;
}
