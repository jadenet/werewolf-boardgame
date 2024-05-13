import { faker } from "@faker-js/faker";
import setups from "../assets/setups.json";
import roles from "../assets/roles.json";

const werewolfRoles = roles
  .filter((role) => {
    return role.team[0] === "Werewolves";
  })
  .sort((a, b) => {
    return a.name > b.name ? 1 : -1;
  });

const regularvillager = roles
  .filter((role) => {
    return role.team[0] === "Village" && role.assignment === "Regular";
  })
  .sort((a, b) => {
    return a.name > b.name ? 1 : -1;
  });

const strongVillager = roles
  .filter((role) => {
    return role.team[0] === "Village" && role.assignment === "Strong";
  })
  .sort((a, b) => {
    return a.name > b.name ? 1 : -1;
  });

const otherVillager = roles
  .filter((role) => {
    return role.team[0] === "Village" && role.assignment === "Other";
  })
  .sort((a, b) => {
    return a.name > b.name ? 1 : -1;
  });

const soloVoting = roles
  .filter((role) => {
    return role.team[0] === "Solo" && role.assignment === "Voting";
  })
  .sort((a, b) => {
    return a.name > b.name ? 1 : -1;
  });

const soloKilling = roles
  .filter((role) => {
    return role.team[0] === "Solo" && role.assignment === "Killing";
  })
  .sort((a, b) => {
    return a.name > b.name ? 1 : -1;
  });

export default function getRoles(num: number) {
  const setup = setups.find((a) => {
    return a.player_count === num;
  });

  const rrv = faker.helpers.arrayElements(
    regularvillager,
    setup?.regular_villagers
  );
  const rsv = faker.helpers.arrayElements(
    strongVillager,
    setup?.strong_villagers
  );
  const rov = faker.helpers.arrayElements(
    otherVillager,
    setup?.other_villagers
  );
  const rw = faker.helpers.arrayElements(werewolfRoles, setup?.werewolves);
  const rv = faker.helpers.arrayElements(soloVoting, setup?.solo_voting);
  const rk = faker.helpers.arrayElements(soloKilling, setup?.solo_killing);

  return rrv.concat(rsv, rov, rw, rv, rk);
}
