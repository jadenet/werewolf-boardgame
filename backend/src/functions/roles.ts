import { faker } from "@faker-js/faker";
import { Action, Card, Player, Role } from "./Interfaces";

export function assignRoles(players: Player[], roles: Role[]) {
  const rolesPool = [...roles];
  const cards: Card[] = [];
  const roundPlayers = new Map<Player, Role[]>();
  const playerStatus = new Map<Player, "Alive" | "Dead">();

  players.map((player: Player) => {
    const role = faker.helpers.arrayElement(rolesPool);
    roundPlayers.set(player, [role]);

    const card: Card = {
      id: crypto.randomUUID(),
      role: role,
      belongsTo: player,
    };
    cards.push(card);

    playerStatus.set(player, "Alive");

    const roleIndex = rolesPool.indexOf(role);
    rolesPool.splice(roleIndex, 1);
  });

  rolesPool.forEach((role: Role, index: number) => {
    const card: Card = {
      id: crypto.randomUUID(),
      role: role,
      centerIndex: index + 1,
    };
    cards.push(card);
  });

  return [cards, roundPlayers, playerStatus] as const;
}

export function getRoleById(roles: Role[], id: Role["id"] | undefined) {
  const foundRole = roles.find((role) => {
    return role.id === id;
  });

  return foundRole;
}

export function getCardFromId(cards: Card[], cardId: Card["id"]) {
  const cardFound = cards.find((card) => {
    return card.id === cardId;
  });
  return cardFound;
}

export function getRoleByName(roles: Role[], name: Role["name"] | undefined) {
  const foundRole = roles.find((role) => {
    return role.name === name;
  });

  return foundRole;
}

export function findPlayersWithRole(
  playerRoles: Map<Player, Role[]>,
  role: Role["name"]
) {
  const players: Player[] = [];
  playerRoles.forEach((currentRole, player) => {
    if (currentRole.at(-1)?.name === role) {
      players.push(player);
    }
  });
  return players;
}

export function findPlayersInTeam(
  playerRoles: Map<Player, Role[]>,
  team: Action["target"]
) {
  const players: Player[] = [];
  playerRoles.forEach((currentRole, player) => {
    if (currentRole.at(-1)?.team === team) {
      players.push(player);
    }
  });
  return players;
}
