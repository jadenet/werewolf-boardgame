import { Role } from "../../Interfaces";
import { buildServerUrl } from "../../app/config/server";

export async function fetchAllRoles(): Promise<Role[]> {
  const response = await fetch(buildServerUrl("/roles"));
  return response.json();
}
