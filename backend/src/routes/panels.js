const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET all panels with their latest status
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        p.id,
        p.name,
        p.room,
        p.building,
        p.ip_address,
        s.power,
        s.volume,
        s.muted,
        s.source,
        s.last_polled
      FROM panels p
      LEFT JOIN panel_status s
        ON p.id = s.panel_id
      ORDER BY p.room, p.name
    `);

    res.json(rows);
  } catch (err) {
    console.error("Failed to load panels:", err.message);

    res.status(500).json({
      ok: false,
      error: "Failed to load panels"
    });
  }
});

// Send command to a single panel
router.post("/:id/command", async (req, res) => {
  const panelId = Number(req.params.id);
  const { command, value } = req.body;

  try {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM panels
      WHERE id = $1
      `,
      [panelId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        ok: false,
        error: "Panel not found"
      });
    }

    res.json({
      ok: true,
      message: "Command received",
      panel: rows[0],
      command,
      value: value ?? null
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      ok: false,
      error: "Database error"
    });
  }
});

// Send command to every panel in a room
router.post("/command/room", async (req, res) => {
  const { room, command, value } = req.body;

  try {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM panels
      WHERE LOWER(room) = LOWER($1)
      `,
      [room]
    );

    res.json({
      ok: true,
      message: "Room command received",
      room,
      command,
      value: value ?? null,
      total: rows.length,
      panels: rows
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      ok: false,
      error: "Database error"
    });
  }
});

module.exports = router;
