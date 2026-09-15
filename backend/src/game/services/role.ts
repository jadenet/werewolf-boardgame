import { faker } from "@faker-js/faker";
import { Player, Role, Team } from "../types";
import roles from "../../assets/roles.json";

// Progression order recommended by the One Night Ultimate Werewolf rulebook: earlier roles
// are introduced for smaller groups, later ones added in as the player count grows.
const ROLE_PRIORITY: Role["id"][] = [
  "werewolf",
  "werewolf",
  "seer",
  "robber",
  "troublemaker",
  "villager",
  "villager",
  "villager",
  "insomniac",
  "mason",
  "mason",
  "drunk",
  "minion",
  "tanner",
  "hunter",
];

// One Night Ultimate Werewolf always deals out (players + 3) roles: everyone gets one,
// and 3 are left face-down in the center.
export function getRequiredRoleCount(playerCount: number) {
  return playerCount + 3;
}

// Builds a role list that scales with the lobby size instead of a fixed set, so games
// with more (or fewer) players always have exactly enough roles (players + 3 for center).
export function buildDefaultRoles(playerCount: number): Role["id"][] {
  const requiredCount = getRequiredRoleCount(playerCount);
  const selected = ROLE_PRIORITY.slice(0, requiredCount);

  while (selected.length < requiredCount) {
    selected.push("villager");
  }

  return selected;
}

// Deals roles to players and sets aside the remaining 3 as center cards.
export function assignRoles(players: Player["id"][], selectedRoleIds?: Role["id"][]) {
  const requiredCount = getRequiredRoleCount(players.length);
  const rolesPool = [...(selectedRoleIds && selectedRoleIds.length > 0 ? selectedRoleIds : buildDefaultRoles(players.length))];

  // Fall back to villagers if a custom/short role list is passed in with too few roles.
  while (rolesPool.length < requiredCount) {
    rolesPool.push("villager");
  }

  const shuffledPool = faker.helpers.shuffle(rolesPool);
  const playerRoles = new Map<Player["id"], Role["id"][]>();

  players.forEach((playerId: Player["id"], index) => {
    playerRoles.set(playerId, [shuffledPool[index]]);
  });

  const centerRoles = shuffledPool.slice(players.length, players.length + 3);

  return { playerRoles, centerRoles };
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
