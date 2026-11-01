import { pool } from "./pool";
import { getPlayerFromId } from "../lobby/lobby";
import { getRoleById } from "../game/services/role";
import { Lobby, Player, Role, Round, Team } from "../game/types";

// Roles at deal time; the round's own maps are mutated by night actions (Robber, Drunk, etc).
export type StartingRoles = {
  playerRoles: Map<Player["id"], Role["id"] | undefined>;
  centerRoles: Role["id"][];
};

export function snapshotStartingRoles(round: Round): StartingRoles {
  return {
    playerRoles: new Map(
      Array.from(round.playerRoles, ([playerId, roleIds]) => [playerId, roleIds[0]])
    ),
    centerRoles: [...round.centerRoles],
  };
}

export function buildRoundPlayerRows(round: Round, startingRoles: StartingRoles) {
  const winningTeams = round.teamWinner ?? [];

  return Array.from(round.playerRoles, ([playerId, roleIds]) => {
    const player = getPlayerFromId(playerId);
    const finalRole = roleIds[0];
    const team = getRoleById(finalRole)?.team as Team | undefined;

    return {
      playerId,
      playerName: player?.name ?? "Unknown",
      isBot: Boolean(player?.isBot),
      startingRole: startingRoles.playerRoles.get(playerId) ?? null,
      finalRole: finalRole ?? null,
      status: round.playerStatus.get(playerId) ?? "Alive",
      votedFor: round.votes?.get(playerId) ?? null,
      isWinner: team !== undefined && winningTeams.includes(team),
    };
  });
}

export async function saveRound(lobby: Lobby, round: Round, startingRoles: StartingRoles) {
  if (!pool) {
    return;
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO rounds (id, lobby_id, started_at, winning_teams, starting_center_roles, final_center_roles)
       VALUES ($1, $2, to_timestamp($3 / 1000.0), $4, $5, $6)`,
      [
        round.id,
        lobby.id,
        round.createdAt,
        round.teamWinner ?? [],
        startingRoles.centerRoles,
        round.centerRoles,
      ]
    );

    for (const row of buildRoundPlayerRows(round, startingRoles)) {
      await client.query(
        `INSERT INTO round_players
           (round_id, player_id, player_name, is_bot, starting_role, final_role, status, voted_for, is_winner)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          round.id,
          row.playerId,
          row.playerName,
          row.isBot,
          row.startingRole,
          row.finalRole,
          row.status,
          row.votedFor,
          row.isWinner,
        ]
      );
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getRecentRounds(limit: number) {
  if (!pool) {
    return [];
  }

  const { rows } = await pool.query(
    `SELECT r.id, r.lobby_id, r.started_at, r.ended_at, r.winning_teams,
            r.starting_center_roles, r.final_center_roles,
            COALESCE(json_agg(json_build_object(
              'playerId', p.player_id,
              'playerName', p.player_name,
              'isBot', p.is_bot,
              'startingRole', p.starting_role,
              'finalRole', p.final_role,
              'status', p.status,
              'votedFor', p.voted_for,
              'isWinner', p.is_winner
            )) FILTER (WHERE p.player_id IS NOT NULL), '[]') AS players
     FROM rounds r
     LEFT JOIN round_players p ON p.round_id = r.id
     GROUP BY r.id
     ORDER BY r.ended_at DESC
     LIMIT $1`,
    [limit]
  );

  return rows;
}
