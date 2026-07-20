const express = require("express");
const router = express.Router();
const pool = require("../db");
const promethean = require("../promethean");
const { parseSource } = require("../poller");

// Maps the source names your frontend's dropdown uses to the actual
// RS-232 command names in promethean.js's COMMANDS object.
// ASSUMPTION: adjust this if your "Change source" button sends different values.
const SOURCE_COMMAND_MAP = {
  HDMI1: "source_hdmi1",
  HDMI2: "source_hdmi2",
  HDMI3: "source_hdmi3",
  "USB-C": "source_usbc",
  VGA: "source_vga1",
  DP: "source_dp",
  AV: "source_av",
};

async function readLiveStatus(ip_address) {
  const [powerResp, volumeResp, muteResp, sourceResp] = await Promise.all([
    promethean.sendCommand(ip_address, "get_power"),
    promethean.sendCommand(ip_address, "get_volume"),
    promethean.sendCommand(ip_address, "get_mute"),
    promethean.sendCommand(ip_address, "get_source"),
  ]);

  return {
    power: promethean.parsePowerStatus(powerResp),
    volume: promethean.parseVolume(volumeResp),
    muted: promethean.parseMuteStatus(muteResp),
    source: parseSource(sourceResp),
  };
}

async function upsertStatus(panelId, status) {
  await pool.query(
    `INSERT INTO panel_status (panel_id, power, volume, muted, source, last_polled)
     VALUES ($1, $2, $3, $4, $5, NOW())
     ON CONFLICT (panel_id)
     DO UPDATE SET power = $2, volume = $3, muted = $4, source = $5, last_polled = NOW()`,
    [panelId, status.power, status.volume, status.muted, status.source]
  );
}

// GET all panels with their latest status
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        p.id, p.name, p.room, p.building, p.ip_address,
        s.power, s.volume, s.muted, s.source, s.last_polled
      FROM panels p
      LEFT JOIN panel_status s ON p.id = s.panel_id
      ORDER BY p.room, p.name
    `);

    res.json(rows);
  } catch (err) {
    console.error("Failed to load panels:", err.message);
    res.status(500).json({ ok: false, error: "Failed to load panels" });
  }
});

// Send command to a single panel — now actually talks to the hardware
router.post("/:id/command", async (req, res) => {
  const panelId = Number(req.params.id);
  const { command, value } = req.body;

  try {
    const { rows } = await pool.query(`SELECT * FROM panels WHERE id = $1`, [panelId]);

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, error: "Panel not found" });
    }

    const panel = rows[0];
    const { ip_address } = panel;
    let status;

    try {
      switch (command) {
        case "power_on":
          await promethean.sendCommand(ip_address, "power_on");
          break;

        case "power_off":
          // No dedicated "power_off" RS-232 command exists — standby is
          // used here since sleep mode blocks further RS-232 commands.
          await promethean.sendCommand(ip_address, "power_standby");
          break;

        case "mute_toggle": {
          const { rows: statusRows } = await pool.query(
            `SELECT muted FROM panel_status WHERE panel_id = $1`,
            [panelId]
          );
          const currentlyMuted = statusRows[0]?.muted || false;
          await promethean.sendCommand(
            ip_address,
            currentlyMuted ? "mute_off" : "mute_on"
          );
          break;
        }

        case "volume_set": {
          const vol = Number(value);
          await promethean.sendCommand(ip_address, promethean.buildVolumeCommand(vol));
          break;
        }

        case "source_set": {
          const sourceCommand = SOURCE_COMMAND_MAP[value];
          if (!sourceCommand) {
            return res
              .status(400)
              .json({ ok: false, error: `Unknown source: ${value}` });
          }
          await promethean.sendCommand(ip_address, sourceCommand);
          break;
        }

        case "refresh_status":
          // No control command — just re-read below.
          break;

        default:
          return res
            .status(400)
            .json({ ok: false, error: `Unknown command: ${command}` });
      }

      status = await readLiveStatus(ip_address);
      await upsertStatus(panelId, status);
    } catch (hardwareError) {
      console.warn(
        `[command] panel ${panelId} (${ip_address}) unreachable:`,
        hardwareError.message
      );

      status = { power: "unknown", volume: 0, muted: false, source: "unknown" };
      await upsertStatus(panelId, status);

      return res.status(200).json({
        ok: false,
        message: "Panel unreachable — command could not be confirmed",
        panel: { ...panel, ...status },
        command,
        value: value ?? null,
      });
    }

    res.json({
      ok: true,
      message: "Command executed",
      panel: { ...panel, ...status },
      command,
      value: value ?? null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Database error" });
  }
});

// Send command to every panel in a room
router.post("/command/room", async (req, res) => {
  const { room, command, value } = req.body;

  try {
    const { rows } = await pool.query(
      `SELECT * FROM panels WHERE LOWER(room) = LOWER($1)`,
      [room]
    );

    res.json({
      ok: true,
      message: "Room command received",
      room,
      command,
      value: value ?? null,
      total: rows.length,
      panels: rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Database error" });
  }
});

module.exports = router;