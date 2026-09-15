import { useEffect, useState } from "react";
import { getRoleNames, getRolesFromTeam } from "../helpers/getRolesFromTeam";
import { Role } from "../../Interfaces";

export type Gamemode = {
  name: string;
  role_percentages: { werewolves: number; solos: number; villagers: number };
  roles: string[];
};

export type RoleTeam = { name: string; roles: Role[] };

const DEFAULT_ROLE_PERCENTAGES = { werewolves: 5, solos: 5, villagers: 90 };

// Loads the gamemode presets and role teams used to configure a new lobby.
export default function useLobbyConfig() {
  const [gamemodes, setGamemodes] = useState<Gamemode[]>([]);
  const [roleTeams, setRoleTeams] = useState<RoleTeam[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadConfig() {
      const [classicRoles, villageRoles, werewolfRoles, soloRoles] = await Promise.all([
        getRoleNames(),
        getRolesFromTeam("Village"),
        getRolesFromTeam("Werewolves"),
        getRolesFromTeam("Solo"),
      ]);

      if (cancelled) {
        return;
      }

      setGamemodes([
        { name: "Classic", role_percentages: DEFAULT_ROLE_PERCENTAGES, roles: classicRoles },
        { name: "Custom", role_percentages: DEFAULT_ROLE_PERCENTAGES, roles: [] },
      ]);

      setRoleTeams([
        { name: "Village", roles: villageRoles },
        { name: "Werewolf", roles: werewolfRoles },
        { name: "Solo", roles: soloRoles },
      ]);
    }

    loadConfig();

    return () => {
      cancelled = true;
    };
  }, []);

  return { gamemodes, roleTeams };
}
