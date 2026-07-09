// test-db.js — one-off script to confirm the pool connects and to
// inspect the real columns of panels / panel_status before poller.js
// is written against them. Safe to delete once confirmed working.

const pool = require("./db");

(async () => {
  try {
    const time = await pool.query("SELECT NOW()");
    console.log("Connected. Server time:", time.rows[0].now);

    const tables = await pool.query(`
      SELECT table_name, column_name, data_type
      FROM information_schema.columns
      WHERE table_name IN ('panels', 'panel_status')
      ORDER BY table_name, ordinal_position
    `);
    console.log("Existing columns:");
    console.table(tables.rows);
  } catch (err) {
    console.error("Connection/query failed:", err.message);
  } finally {
    await pool.end();
  }
})();
