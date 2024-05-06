import { faker } from "@faker-js/faker";

export default function assignRoles(players: any, roles: any) {
  const rolesClone = [...roles];
  players.map((player: any, index: any) => {
    const role = faker.helpers.arrayElement(rolesClone);
    players[index].role = role.name;
    players[index].abilities = role.abilities || [];
    players[index].status = "Alive";
    players[index].team = role.team;

    const roleIndex = rolesClone.indexOf(role);
    rolesClone.splice(roleIndex, 1);
  });

  return players;
}
