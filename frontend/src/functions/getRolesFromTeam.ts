import roles from "../../../backend/assets/roles.json";

export function getRoleNames() {
  const roleNames = roles.map((role) => {
    return role.name;
  });

  return roleNames;
}

export function getRoles() {
  const roleInfo = roles.map((role) => {
    return { name: role.name, img: role.img };
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
