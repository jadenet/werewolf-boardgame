import { Role } from "@/Interfaces";

let roles: Role[] = []

const serverUrl =
  process.env.NODE_ENV === "production"
    ? "https://werewolf-backend.onrender.com"
    : "http://localhost:10000";
 
async function getAllRoles() {
  const rolesResponse = await fetch(serverUrl + "/roles", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  roles = await rolesResponse.json()
}

getAllRoles()

export function getRoleNames() {
  const roleNames = roles.map((role) => {
    return role.name;
  });

  return roleNames;
}

export function getRoles() {
  const roleInfo = roles.map((role) => {
    return { name: role.name, img: role.image };
  });

  return roleInfo;
}

export function getRolesFromTeam(teamName: string) {
  const filteredRoles = roles
    .filter((role) => {
      return role.team[0] === teamName;
    })
    .sort((a, b) => {
      return a.name > b.name ? 1 : -1;
    });

  return filteredRoles;
}
