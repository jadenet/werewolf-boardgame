import { Team } from "../../Interfaces";

const TEAM_LABELS: Partial<Record<Team, string>> = {
  Villagers: "The Villagers",
  Werewolves: "The Werewolves",
  Solo: "The Tanner",
};

// Team names are already plural collective nouns ("Villagers", "Werewolves"), except the
// lone Tanner, so pluralization can't just be based on how many teams won.
export function getWinnerAnnouncement(winner: Team[] | null | undefined) {
  if (!winner || winner.length === 0) {
    return null;
  }

  const labels = winner.map((team) => TEAM_LABELS[team] ?? team);
  const verb = winner.length === 1 && winner[0] === "Solo" ? "wins" : "win";

  return `${labels.join(" & ")} ${verb}!`;
}
