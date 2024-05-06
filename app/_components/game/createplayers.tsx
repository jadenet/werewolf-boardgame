import { faker } from "@faker-js/faker";

export default function createPlayers(num: number) {
  let players: any[] = [];

  for (let index = 0; index < num; index++) {
    players.push({
      name: faker.internet.userName(),
      role: null,
      status: "",
      abilities: [],
    });
  }

  return players
}
