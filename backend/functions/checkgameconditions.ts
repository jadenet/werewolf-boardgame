export default function checkGameConditions(players: any, roles) {
  const alivePlayers = players.filter((player) => player.status === "Alive");
  const deadPlayers = players.filter((player) => player.status !== "Alive");
  const aliveVillagers = players.filter(
    (player) => player.status === "Alive" && player.team.includes("Village")
  );
  const aliveWerewolves = players.filter(
    (player) => player.status === "Alive" && player.team.includes("Werewolves")
  );
  const fool = players.find((player) => player.role === "Fool");
  const headhunter = players.find((player) => player.role === "Headhunter");
  const aliveLoveCouple = players.filter(
    (player) => player.status === "Alive" && player.team.includes("Love Couple")
  );
  const aliveSoloKillers = players.filter(
    (player) =>
      player.status === "Alive" &&
      player.team.includes("Solo") &&
      roles[roles.findIndex((role) => player.role === role.name)].assignment ===
        "Killing"
  );

  let winner: string | null = null;

  if (fool && fool.status === "Lynched") {
    winner = "Fool";
  } else if (
    headhunter &&
    headhunter.target &&
    headhunter.target.status === "Lynched" &&
    headhunter.status === "Alive"
  ) {
    winner = "Headhunter";
  } else if (
    aliveVillagers.length >= 1 &&
    aliveWerewolves.length === 0 &&
    aliveSoloKillers.length === 0
  ) {
    winner = "Village";
  } else if (
    aliveWerewolves.length >= 1 &&
    aliveWerewolves.length >= aliveVillagers.length &&
    aliveSoloKillers.length === 0
  ) {
    winner = "Werewolves";
  } else if (
    aliveVillagers.length === 0 &&
    aliveWerewolves.length === 0 &&
    (!headhunter || headhunter.status !== "Alive") &&
    (!fool || fool.status !== "Alive")
  ) {
    winner = "Solo Killer";
  } else if (alivePlayers.sort() === aliveLoveCouple.sort()) {
    winner = "Love Couple";
  }

  return winner;
}
