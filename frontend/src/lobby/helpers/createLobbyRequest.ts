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

  if (!response.ok) {
    throw new Error(`Lobby creation failed (${response.status}).`);
  }

  const result = await response.json() as CreateLobbyResult;
  if (result.status !== "success" || !result.id) {
    throw new Error(result.errors?.join(" ") || "The server did not create a lobby.");
  }

  return result;
}
