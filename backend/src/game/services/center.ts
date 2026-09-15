import { Player, Round } from "../types";

const CENTER_ID_PREFIX = "center-";

// Center cards are addressed with pseudo player ids ("center-0", "center-1", "center-2")
// so the existing target/selection machinery (built around Player["id"]) can be reused as-is.
export function getCenterCardIds(round: Round): Player["id"][] {
  return round.centerRoles.map((_, index) => `${CENTER_ID_PREFIX}${index}`);
}

export function isCenterCardId(id: Player["id"]) {
  return id.startsWith(CENTER_ID_PREFIX);
}

export function getCenterCardIndex(id: Player["id"]) {
  return Number(id.slice(CENTER_ID_PREFIX.length));
}

export function getCenterCardLabel(id: Player["id"]) {
  return `Center Card ${getCenterCardIndex(id) + 1}`;
}

export function getCenterRoleId(round: Round, id: Player["id"]) {
  return round.centerRoles[getCenterCardIndex(id)];
}

export function setCenterRoleId(round: Round, id: Player["id"], roleId: string) {
  round.centerRoles[getCenterCardIndex(id)] = roleId;
}
