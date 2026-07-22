const express = require("express");
const router = express.Router();
const pool = require("../db");

const {
  sendCommand,
  buildVolumeCommand,
} = require("../promethean");

const {
  pollAllPanels,
} = require("../poller");

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getPanel(panelId) {
  const { rows } = await pool.query(
    `
      SELECT
        p.id,
        p.name,
        p.room,
        p.building,
        p.ip_address,
        p.model,
        p.serial_no,
        s.power,
        s.volume,
        s.muted,
        s.source,
        s.last_polled
      FROM panels p
      LEFT JOIN panel_status s
        ON p.id = s.panel_id
      WHERE p.id = $1
    `,
    [panelId]
  );

  return rows[0] || null;
}

function normalizeSource(value) {
  const source = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]/g, "")
    .replace(/^source_/, "");

  const sourceMap = {
    hdmi1: "source_hdmi1",
    hdmi2: "source_hdmi2",
    hdmi3: "source_hdmi3",
    usbc: "source_usbc",
    vga: "source_vga1",
    vga1: "source_vga1",
    dp: "source_dp",
    displayport: "source_dp",
    ops: "source_ops",
    android: "source_android",
    av: "source_av",
  };

  return sourceMap[source];
}

// Insert a row into command_log for a real user-triggered action.
async function logCommand({ panelId, command, value, success, errorMsg }) {
  try {
    await pool.query(
      `INSERT INTO command_log (panel_id, command, value, sent_by, success, error_msg, ts)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [panelId, command, value ?? null, "dashboard:user", success, errorMsg ?? null]
    );
  } catch (logErr) {
    // Never let a logging failure break the actual command response.
    console.error("Failed to write command_log row:", logErr.message);
  }
}

// GET all panels with their latest stored status
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        p.id,
        p.name,
        p.room,
        p.building,
        p.ip_address,
        p.model,
        p.serial_no,
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
  } catch (error) {
    console.error("Failed to load panels:", error.message);

    res.status(500).json({
      ok: false,
      error: "Failed to load panels",
    });
  }
});

// GET recent command history, joined with panel name/room for display
router.get("/commands", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        c.id,
        c.panel_id,
        p.name AS panel_name,
        p.room,
        c.command,
        c.value,
        c.success,
        c.error_msg,
        c.ts
      FROM command_log c
      LEFT JOIN panels p
        ON c.panel_id = p.id
      WHERE c.sent_by = 'dashboard:user'
      ORDER BY c.ts DESC
      LIMIT 100
    `);

    res.json(rows);
  } catch (error) {
    console.error("Failed to load command history:", error.message);

    res.status(500).json({
      ok: false,
      error: "Failed to load command history",
    });
  }
});

// Send a command to one physical Promethean screen
router.post("/:id/command", async (req, res) => {
  const panelId = Number(req.params.id);
  const { command, value } = req.body;

  if (!Number.isInteger(panelId)) {
    return res.status(400).json({
      ok: false,
      error: "Invalid panel ID",
    });
  }

  if (!command) {
    return res.status(400).json({
      ok: false,
      error: "Command is required",
    });
  }

  try {
    const panel = await getPanel(panelId);

    if (!panel) {
      return res.status(404).json({
        ok: false,
        error: "Panel not found",
      });
    }

    const ip = panel.ip_address;

    switch (command) {
      case "power_on":
        await sendCommand(ip, "power_on");
        break;

      case "power_off":
      case "power_standby":
        // Promethean uses standby as the normal power-off command.
        await sendCommand(ip, "power_standby");
        break;

      case "power_sleep":
        await sendCommand(ip, "power_sleep");
        break;

      case "volume_up":
        await sendCommand(ip, "volume_up");
        break;

      case "volume_down":
        await sendCommand(ip, "volume_down");
        break;

      case "volume_set": {
        const volume = Number(value);

        if (!Number.isFinite(volume) || volume < 0 || volume > 100) {
          return res.status(400).json({
            ok: false,
            error: "Volume must be between 0 and 100",
          });
        }

        await sendCommand(ip, buildVolumeCommand(volume));
        break;
      }

      case "mute_toggle": {
        const muteCommand = panel.muted ? "mute_off" : "mute_on";
        await sendCommand(ip, muteCommand);
        break;
      }

      case "mute_on":
        await sendCommand(ip, "mute_on");
        break;

      case "mute_off":
        await sendCommand(ip, "mute_off");
        break;

      case "source_set": {
        const sourceCommand = normalizeSource(value);

        if (!sourceCommand) {
          return res.status(400).json({
            ok: false,
            error: `Unsupported input source: ${value}`,
          });
        }

        await sendCommand(ip, sourceCommand);
        break;
      }

      case "refresh_status":
        // No control command is required; polling below refreshes the status.
        break;

      default:
        return res.status(400).json({
          ok: false,
          error: `Unsupported command: ${command}`,
        });
    }

    // Give the physical display time to apply the command.
    await wait(700);

    // Poll screens and update panel_status in PostgreSQL.
    await pollAllPanels();

    const updatedPanel = await getPanel(panelId);

    // Log successful real user command (skip refresh_status — it's a no-op passthrough, not a real action).
    if (command !== "refresh_status") {
      await logCommand({
        panelId,
        command,
        value,
        success: true,
        errorMsg: null,
      });
    }

    res.json({
      ok: true,
      message: "Command sent to Promethean screen",
      command,
      value: value ?? null,
      panel: updatedPanel,
    });
  } catch (error) {
    console.error(
      `Panel ${panelId} command failed:`,
      error.message
    );

    if (command !== "refresh_status") {
      await logCommand({
        panelId,
        command,
        value,
        success: false,
        errorMsg: error.message || "Failed to send panel command",
      });
    }

    res.status(500).json({
      ok: false,
      error: error.message || "Failed to send panel command",
    });
  }
});

// Send a command to every screen in a classroom
router.post("/command/room", async (req, res) => {
  const { room, command, value } = req.body;

  if (!room || !command) {
    return res.status(400).json({
      ok: false,
      error: "Room and command are required",
    });
  }

  try {
    const { rows: panels } = await pool.query(
      `
        SELECT id
        FROM panels
        WHERE LOWER(room) = LOWER($1)
        ORDER BY id
      `,
      [room]
    );

    if (panels.length === 0) {
      return res.status(404).json({
        ok: false,
        error: "No panels found in this room",
      });
    }

    res.json({
      ok: true,
      message:
        "Use the individual panel command endpoint for each returned panel",
      room,
      command,
      value: value ?? null,
      total: panels.length,
      panel_ids: panels.map((panel) => panel.id),
    });
  } catch (error) {
    console.error("Room command failed:", error.message);

    res.status(500).json({
      ok: false,
      error: "Room command failed",
    });
  }
});

module.exports = router;