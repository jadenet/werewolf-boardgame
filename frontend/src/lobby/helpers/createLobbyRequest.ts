import { buildServerUrl } from "../../app/config/server";

export type CreateLobbyResult = {
  status: string;
  id?: string;
  errors?: string[];
};

export async function createLobbyRequest(gamemode: string, roles: string[]): Promise<CreateLobbyResult> {
  const response = await fetch(buildServerUrl("/lobbies"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roles, gamemode }),
  });

  return response.json();
}
