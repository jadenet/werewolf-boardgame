export default function checkGameConditions(
  alivePlayers: any[],
  aliveVillagers: string | any[],
  aliveWerewolves: string | any[],
  headhunter: { target: { status: string; }; status: string; },
  fool: { status: string; },
  aliveSoloKillers: string | any[],
  aliveLoveCouple: any[]
) {
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
