import { faker } from "@faker-js/faker";
import { Player, Role, Team } from "../types";
import roles from "../../assets/roles.json";

export function assignRoles(players: Player["id"][], roles: Role[]) {
  const rolesPool = [...roles];
  const assignedRoles = new Map<Player["id"], Role["id"][]>();

  players.map((playerId: Player["id"]) => {
    const role = faker.helpers.arrayElement(rolesPool);
    assignedRoles.set(playerId, [role.id]);

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

export function getPlayersByRole(
  playerRoles: Map<Player["id"], Role["id"][]>,
  role: Role["id"]
) {
  const players: Player["id"][] = [];
  playerRoles.forEach((playerRole, playerId) => {
    if (playerRole.includes(role)) {
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
