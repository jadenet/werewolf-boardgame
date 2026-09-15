import { Server, Socket } from "socket.io";
import { getRoleById } from "../game/services/role";
import { Lobby, Player, Role } from "../game/types";

const MAX_SELECTED_ROLES = 40;

// Only the host can change the role selection, and only before the game has started.
export function registerUpdateSelectedRolesHandler(io: Server, socket: Socket, lobby: Lobby) {
  socket.on(
    "updateSelectedRoles",
    (playerClicked: Player["id"], roleIds: Role["id"][], callback?: Function) => {
      if (playerClicked !== lobby.hostId || lobby.gameStarted) {
        if (callback) callback({ success: false, error: "Not authorized or game already in progress" });
        return;
      }

      if (!Array.isArray(roleIds) || roleIds.length > MAX_SELECTED_ROLES) {
        if (callback) callback({ success: false, error: "Invalid role selection" });
        return;
      }

      const validRoleIds = roleIds.filter((roleId) => Boolean(getRoleById(roleId)));
      if (validRoleIds.length !== roleIds.length) {
        if (callback) callback({ success: false, error: "One or more roles were not recognized" });
        return;
      }

      lobby.selectedRoleIds = validRoleIds;
      io.to(lobby.id).emit("selectedRolesChanged", lobby.selectedRoleIds);

      if (callback) callback({ success: true });
    }
  );
}
