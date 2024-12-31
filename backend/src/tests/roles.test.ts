import { describe, it } from "node:test";
import assert from "node:assert";
import { faker } from "@faker-js/faker";
import { Socket } from "socket.io";
import roles from "../assets/roles.json";
import { assignRoles } from "../functions/roles";
import { Player, Role } from "../functions/Interfaces";

describe("assignRoles function", () => {
  const players: Player[] = [];
  const playerCount = 6;
  const rolesCount = 9;
  for (let index = 0; index < playerCount; index++) {
    const player = {
      id: crypto.randomUUID(),
      name: faker.person.firstName(),
      socket: {} as Socket,
    };

    players.push(player);
  }

  const newRoles: Role[] = faker.helpers.arrayElements(
    roles as Role[],
    rolesCount
  );
  it("should error if the roleas length is not 3 elements longer than the players", () => {
    //   const [cards, roundPlayers, playerStatus] = assignRoles(players, newRoles)
    // assert.strictEqual
  });
  it("should return a list of cards, and mapping of playerRoles and playerStatus", () => {
    const [cards, roundPlayers, playerStatus] = assignRoles(players, newRoles);
    players.forEach((player) => {
      assert.notStrictEqual(roundPlayers.get(player), null);
      assert.strictEqual(playerStatus.get(player), "Alive");
      const hasCard = cards.find((card) => {
        return card.belongsTo === player;
      });

      assert.ok(hasCard);
    });

    let playerCardAmount = 0;
    let centerCardAmount = 0;

    cards.forEach((card) => {
      assert.ok(card.role);
      if (card.belongsTo) {
        playerCardAmount++;
      } else if (card.centerIndex) {
        centerCardAmount++;
      }
    });

    assert.strictEqual(playerCardAmount, playerCount);
    assert.strictEqual(centerCardAmount, rolesCount - playerCount);
  });
});
