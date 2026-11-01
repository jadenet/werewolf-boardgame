import pg from "pg";

// Persistence is optional: without DATABASE_URL the server runs fully in memory, as before.
export const pool = process.env.DATABASE_URL
  ? new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      // Hosted providers (e.g. Render's external URL) require SSL; local Postgres usually doesn't.
      ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
    })
  : null;

pool?.on("error", (error) => {
  console.error("Unexpected Postgres client error:", error);
});
