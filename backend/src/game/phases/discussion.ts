import { getPlayerFromId } from "../../lobby/lobby";
import { Player } from "../types";
import { validateDiscussionSkip } from "../validator";
import { Server } from "socket.io";

export default async function discussionPhase(
  players: Player["id"][],
  discussionDuration: number,
  io: Server,
  lobbyId: string
) {
  let discussionSkips: Player["id"][] = [];
  const humanPlayers = players.filter((playerId) => !getPlayerFromId(playerId)?.isBot);
  const requiredSkips = Math.floor(humanPlayers.length / 2) + 1;

  // Emit discussion start to all players
  players.forEach((playerId) => {
    const player = getPlayerFromId(playerId);
    if (player && player.socket) {
      player.socket.emit("startDiscussion", discussionDuration);
    }
  });

  io.to(lobbyId).emit("discussionSkipUpdate", { votes: 0, required: requiredSkips });

  // Wait for discussion duration or majority skip
  await new Promise<void>((resolve) => {
    let settled = false;
    const handlers = new Map<Player["id"], () => void>();
    let timeout: ReturnType<typeof setTimeout>;

    const finish = () => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeout);
      handlers.forEach((handler, playerId) => {
        getPlayerFromId(playerId)?.socket?.off("discussionSkip", handler);
      });
      resolve();
    };

    const skipHandler = (playerId: string) => {
      if (settled) {
        return;
      }
      if (validateDiscussionSkip(discussionSkips, playerId)) {
        discussionSkips.push(playerId);
        io.to(lobbyId).emit("discussionSkipUpdate", { votes: discussionSkips.length, required: requiredSkips });
        if (discussionSkips.length >= requiredSkips) {
          finish();
        }
      }
    };

    // Set up skip listeners
    humanPlayers.forEach((playerId) => {
      const player = getPlayerFromId(playerId);
      if (player && player.socket) {
        const handler = () => {
          skipHandler(player.id);
        };
        handlers.set(player.id, handler);
        player.socket.once("discussionSkip", handler);
      }
    });

    // Timeout after discussion duration
    timeout = setTimeout(finish, discussionDuration * 1000);
  });
}