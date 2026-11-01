import { pool } from "./pool";

// Idempotent schema setup, run on every server start.
const SCHEMA = `
  CREATE TABLE IF NOT EXISTS rounds (
    id UUID PRIMARY KEY,
    lobby_id UUID NOT NULL,
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    winning_teams TEXT[] NOT NULL,
    starting_center_roles TEXT[] NOT NULL,
    final_center_roles TEXT[] NOT NULL
  );

  CREATE INDEX IF NOT EXISTS rounds_ended_at_idx ON rounds (ended_at DESC);

  CREATE TABLE IF NOT EXISTS round_players (
    round_id UUID NOT NULL REFERENCES rounds (id) ON DELETE CASCADE,
    player_id UUID NOT NULL,
    player_name TEXT NOT NULL,
    is_bot BOOLEAN NOT NULL,
    starting_role TEXT,
    final_role TEXT,
    status TEXT NOT NULL,
    voted_for UUID,
    is_winner BOOLEAN NOT NULL,
    PRIMARY KEY (round_id, player_id)
  );
`;

export async function migrate() {
  if (!pool) {
    console.log("DATABASE_URL not set; game history will not be persisted.");
    return;
  }

  await pool.query(SCHEMA);
}
