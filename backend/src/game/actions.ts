import { findPlayersInTeam, findPlayersWithRole, getCardFromId } from "./roles";
import { Ability, Action, Card, Player, Role, Round } from "./Interfaces";
import allAbilities from "../../src/assets/abilities.json";

export function switchRoles(
  target1: Card,
  target2: Card,
  playerRoles: Map<Player, Role[]>
) {
  const temp = target1.centerIndex;
  const temp2 = target1.belongsTo;
  target1.centerIndex = target2.centerIndex;
  target1.belongsTo = target2.belongsTo;
  target2.centerIndex = temp;
  target2.belongsTo = temp2;

  if (target1.belongsTo) {
    const roles = playerRoles.get(target1.belongsTo);

    if (roles) {
      roles.push(target1.role);
      playerRoles.set(target1.belongsTo, roles);
    }
  }

  if (target2.belongsTo) {
    const roles = playerRoles.get(target2.belongsTo);

    if (roles) {
      roles.push(target2.role);
      playerRoles.set(target2.belongsTo, roles);
    }
  }
}

export function getAbilitiesFromRoles(
  playerRoles: Map<Player, Role[]>,
  roles: Role[]
) {
  const abilities: { ability: Ability; players: Player[] }[][] = [];

  roles.forEach((role: Role) => {
    const playersWithRole: Player[] = findPlayersWithRole(
      playerRoles,
      role.name
    );

    role.abilities.forEach((abilityName: Ability["name"]) => {
      const ability = getAbilityByName(abilityName);
      if (ability && ability.conditions?.queue) {
        abilities[ability.conditions.queue].push({
          ability: ability,
          players: playersWithRole,
        });
      }
    });
  });

  return abilities;
}

export function getAbilityByName(abilityName: Ability["name"]) {
  return allAbilities.find((ability) => {
    return ability.name === abilityName;
  }) as Ability;
}

export function getActionFunctionByName(name: string) {
  let func: Function = async () => {};
  actions.forEach((action) => {
    if (action.name === name) {
      func = action.func;
    }
  });
  return func;
}

const actions = [
  {
    name: "Switch",
    func: async (
      round: Round,
      player: Player,
      playerRoles: Map<Player, Role[]>,
      target: Action["target"],
      exclusions: Action["exclusions"]
    ) => {
      player.socket
        .timeout(round.options.actionDuration * 1000)
        .emit(
          "switchAction",
          target,
          exclusions,
          (err: Error, res: { card1Id: Card["id"]; card2Id: Card["id"] }) => {
            const card1 = getCardFromId(round.cards, res.card1Id);
            const card2 = getCardFromId(round.cards, res.card2Id);
            if (!err && card1 && card2) {
              switchRoles(card1, card2, playerRoles);
            }
          }
        );
      setTimeout(() => {
        player.socket.emit("switchActionEnd");
      }, round.options.actionDuration * 1000);
    },
  },
  {
    name: "ViewRole",
    func: async (
      round: Round,
      player: Player,
      target: Action["target"],
      exclusions: Action["exclusions"]
    ) => {
      player.socket
        .timeout(round.options.actionDuration * 1000)
        .emit(
          "viewRoleAction",
          target,
          exclusions,
          (err: Error, res: { card1Id: Card["id"] }) => {
            const card1 = getCardFromId(round.cards, res.card1Id);
            if (!err && card1) {
              player.socket.emit("viewRoleResponse", card1.role);
            }
          }
        );
      setTimeout(() => {
        player.socket.emit("viewRoleActionEnd");
      }, round.options.actionDuration * 1000);
    },
  },
  {
    name: "ViewAllOfRole",
    func: async (round: Round, player: Player, target: Action["target"]) => {
      const playersWithRole = findPlayersWithRole(round.playerRoles, target);
      const playerIndexIfIsRole = playersWithRole.indexOf(player);
      if (playerIndexIfIsRole) {
        playersWithRole.splice(playerIndexIfIsRole, 1);
      }

      player.socket.emit("viewAllOfRoleAction", playersWithRole);
      setTimeout(() => {
        player.socket.emit("viewAllOfRoleActionEnd");
      }, round.options.actionDuration * 1000);
    },
  },
  {
    name: "ViewTeam",
    func: async (round: Round, player: Player, target: Action["target"]) => {
      const playersInTeam = findPlayersInTeam(round.playerRoles, target);
      const playerIndexIfInTeam = playersInTeam.indexOf(player);
      if (playerIndexIfInTeam) {
        playersInTeam.splice(playerIndexIfInTeam, 1);
      }

      player.socket.emit("viewTeamAction", playersInTeam);
      setTimeout(() => {
        player.socket.emit("viewTeamActionEnd");
      }, round.options.actionDuration * 1000);
    },
  },
];
