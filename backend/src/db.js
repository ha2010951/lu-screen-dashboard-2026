/**
 * db.js — Postgres connection pool.
 *
 * OWNS: the single shared pg Pool for this app.
 * DOES NOT KNOW ABOUT: promethean.js, Express routes, panel command logic.
 *
 * --------------------------------------------------------------------
 * CONTRACT (Person C depends on this):
 *
 *   pool.query(sql, params) -> Promise<{ rows: [...] }>
 * --------------------------------------------------------------------
 *
 * Connection details come entirely from .env (see .env.example).
 * For local dev: point PG_HOST/PG_PORT at an SSH tunnel to the real
 * server Postgres (e.g. PG_HOST=localhost, PG_PORT=5433 via
 * `ssh -L 5433:localhost:5432 intern1@<server_ip>`).
 * On the server itself: PG_HOST will instead be the Docker bridge
 * gateway (e.g. 172.17.0.1) since Postgres runs natively on the host,
 * not inside a container.
 */

// Explicit path: the single .env lives at the repo root, two levels up
// from backend/src/ — without this, dotenv only finds it when the
// process happens to be launched with cwd == repo root.
require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.PG_HOST,
  port: parseInt(process.env.PG_PORT, 10),
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
});

pool.on("error", (err) => {
  // Catches errors on idle clients in the pool so one bad connection
  // doesn't crash the whole process.
  console.error("Unexpected Postgres pool error:", err.message);
});

module.exports = pool;
