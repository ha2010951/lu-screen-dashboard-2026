/**
 * poller.js — polls every panel in `panels` every 30s and writes the
 * result into `panel_status`.
 *
 * OWNS: the polling loop and the panels <-> promethean.js <-> Postgres wiring.
 * DOES NOT KNOW ABOUT: Express routes.
 *
 * Schema in use (confirmed via test-db.js against real DB):
 *   panels:        id, name, room, building, ip_address, model, serial_no, created_at
 *   panel_status:  id, panel_id, power, volume, muted, source, last_polled
 *
 * ASSUMPTION: panel_status.panel_id has a UNIQUE constraint so the
 * ON CONFLICT upsert below works (one status row per panel, overwritten
 * each poll). If that constraint doesn't exist yet, flag it in group
 * chat before relying on this — `ALTER TABLE panel_status ADD CONSTRAINT
 * panel_status_panel_id_key UNIQUE (panel_id);` would add it.
 */

const pool = require("./db");
const promethean = require("./promethean");

const POLL_INTERVAL_MS = 30000;

// Reverse-lookup byte -> source name, built from promethean.js's COMMANDS.
// (source_usbc's earlier byte collision with source_hdmi3 is resolved and
// confirmed on real hardware — see promethean.js.)
function buildSourceByteMap() {
  const map = {};
  const allSourceCommands = {
    ...Object.fromEntries(
      Object.entries(promethean.COMMANDS).filter(([name]) => name.startsWith("source_"))
    ),
    ...promethean.COMMANDS_UNVERIFIED,
  };
  for (const [name, buf] of Object.entries(allSourceCommands)) {
    const dataByte = buf[3]; // F6 [cmd] [type] [data] [checksum] 6F
    if (!(dataByte in map)) map[dataByte] = name;
  }
  return map;
}
const SOURCE_BYTE_MAP = buildSourceByteMap();

function parseSource(buf) {
  if (!buf || buf.length < 3) return "unknown";
  return SOURCE_BYTE_MAP[buf[buf.length - 3]] || "unknown";
}

async function pollPanel(panel) {
  const { id, ip_address } = panel;
  try {
    const [powerResp, volumeResp, muteResp, sourceResp] = await Promise.all([
      promethean.sendCommand(ip_address, "get_power_v2"),
      promethean.sendCommand(ip_address, "get_volume"),
      promethean.sendCommand(ip_address, "get_mute"),
      promethean.sendCommand(ip_address, "get_source"),
    ]);

    const status = {
      power: promethean.parsePowerStatus(powerResp),
      volume: promethean.parseVolume(volumeResp),
      muted: promethean.parseMuteStatus(muteResp),
      source: parseSource(sourceResp),
    };

    await upsertStatus(id, status);
    console.log(`[poller] panel ${id} (${ip_address}) ->`, status);
  } catch (err) {
    // Offline / unreachable panel (timeout, ECONNREFUSED, etc). Don't
    // crash the loop — write a status row that reflects "couldn't reach it"
    // so the offline path is visible in the DB too.
    await upsertStatus(id, {
      power: "unknown",
      volume: 0,
      muted: false,
      source: "unknown",
    });
    console.warn(`[poller] panel ${id} (${ip_address}) unreachable:`, err.message);
  }
}

async function upsertStatus(panelId, { power, volume, muted, source }) {
  await pool.query(
    `INSERT INTO panel_status (panel_id, power, volume, muted, source, last_polled)
     VALUES ($1, $2, $3, $4, $5, NOW())
     ON CONFLICT (panel_id)
     DO UPDATE SET power = $2, volume = $3, muted = $4, source = $5, last_polled = NOW()`,
    [panelId, power, volume, muted, source]
  );
}

async function pollAllPanels() {
  const { rows: panels } = await pool.query("SELECT id, ip_address FROM panels");
  if (panels.length === 0) {
    console.log("[poller] no panels found in `panels` table.");
    return;
  }
  // allSettled so one bad panel never stops the others from being polled.
  await Promise.allSettled(panels.map(pollPanel));
}

function startPolling() {
  console.log(`[poller] starting, interval = ${POLL_INTERVAL_MS / 1000}s`);
  pollAllPanels(); // run once immediately, then on interval
  setInterval(pollAllPanels, POLL_INTERVAL_MS);
}

module.exports = { startPolling, pollAllPanels, parseSource };

// Run directly for local testing: node poller.js
if (require.main === module) {
  startPolling();
}
