/**
 * promethean.js — RS-232 over TCP/IP command module for Promethean ActivPanel screens.
 *
 * OWNS: raw TCP socket communication with physical screens.
 * DOES NOT KNOW ABOUT: Postgres, Express routes, WhatsApp, or n8n.
 *
 * --------------------------------------------------------------------
 * CONTRACT (agree on this before other files depend on it):
 *
 *   sendCommand(ip, cmdOrName, timeoutMs = 5000) -> Promise<Buffer>
 *   buildVolumeCommand(vol) -> Buffer
 *   parsePowerStatus(buf) -> string   ("on" | "standby" | "sleep" | "unknown")
 *   parseVolume(buf) -> number        (0-100)
 *   parseMuteStatus(buf) -> boolean
 *   parseAscii(buf) -> string
 * --------------------------------------------------------------------
 *
 * FIXES applied vs. the original guide's version (see Dashboard_todo.md):
 *   1. Checksum now correctly includes the 0xF6 head byte.
 *      Verified against known-good frame: Get Power Status
 *      F6 01 02 00 F9 6F  ->  0xF6+0x01+0x02+0x00 = 0xF9  (matches)
 *   2. parseAscii() now excludes the checksum byte, not just the
 *      terminator — the original left a stray garbage char at the
 *      end of every ASCII response (firmware/serial/model).
 *   3. Confirmed on real hardware: power_on DOES work over TCP/IP
 *      from Standby (contradicts an earlier note in the todo doc —
 *      worth re-testing specifically from deep Sleep too).
 */

const net = require("net");

const COMMANDS = {
  power_on:         Buffer.from([0xF6, 0x01, 0x01, 0x01, 0xF9, 0x6F]),
  power_standby:    Buffer.from([0xF6, 0x01, 0x01, 0x00, 0xF8, 0x6F]),
  power_sleep:      Buffer.from([0xF6, 0x01, 0x05, 0x00, 0xFC, 0x6F]),
  get_power:        Buffer.from([0xF6, 0x01, 0x02, 0x00, 0xF9, 0x6F]),
  get_power_v2:     Buffer.from([0xF6, 0x01, 0x03, 0xFF, 0xF9, 0x6F]), // firmware 2.1.0+

  get_firmware:     Buffer.from([0xF6, 0x03, 0x01, 0x00, 0xFA, 0x6F]),
  get_touch_fw:     Buffer.from([0xF6, 0x03, 0x02, 0x00, 0xFB, 0x6F]),
  get_touch_serial: Buffer.from([0xF6, 0x03, 0x03, 0x00, 0xFC, 0x6F]),
  get_serial:       Buffer.from([0xF6, 0x03, 0x04, 0x00, 0xFD, 0x6F]),
  get_model:        Buffer.from([0xF6, 0x03, 0x05, 0x00, 0xFE, 0x6F]),

  volume_up:        Buffer.from([0xF6, 0x0C, 0x00, 0x01, 0x03, 0x6F]),
  volume_down:      Buffer.from([0xF6, 0x0C, 0x00, 0x00, 0x02, 0x6F]),
  get_volume:       Buffer.from([0xF6, 0x0C, 0x02, 0x00, 0x04, 0x6F]),

  mute_on:          Buffer.from([0xF6, 0x02, 0x00, 0x01, 0xF9, 0x6F]),
  mute_off:         Buffer.from([0xF6, 0x02, 0x00, 0x00, 0xF8, 0x6F]),
  get_mute:         Buffer.from([0xF6, 0x02, 0x02, 0x00, 0xFA, 0x6F]),

  source_av:        Buffer.from([0xF6, 0x30, 0x01, 0x01, 0x28, 0x6F]),
  source_vga1:      Buffer.from([0xF6, 0x30, 0x01, 0x08, 0x2F, 0x6F]),
  source_hdmi1:     Buffer.from([0xF6, 0x30, 0x01, 0x09, 0x30, 0x6F]),
  source_hdmi2:     Buffer.from([0xF6, 0x30, 0x01, 0x0A, 0x31, 0x6F]),
  source_hdmi3:     Buffer.from([0xF6, 0x30, 0x01, 0x13, 0x3A, 0x6F]),
  source_dp:        Buffer.from([0xF6, 0x30, 0x01, 0x14, 0x3B, 0x6F]),
  source_ops:       Buffer.from([0xF6, 0x30, 0x01, 0x12, 0x39, 0x6F]),
  source_android:   Buffer.from([0xF6, 0x30, 0x01, 0x0B, 0x32, 0x6F]),
  get_source:       Buffer.from([0xF6, 0x30, 0x02, 0x00, 0x28, 0x6F]),

  freeze_on:        Buffer.from([0xF6, 0x32, 0x01, 0x01, 0x2A, 0x6F]),
  freeze_off:       Buffer.from([0xF6, 0x32, 0x01, 0x02, 0x2B, 0x6F]),
  get_freeze:       Buffer.from([0xF6, 0x32, 0x02, 0x00, 0x2A, 0x6F]),
};

// Flagged UNVERIFIED in Dashboard_todo.md — USB-C1's code collides with
// HDMI3's. Do not trust in production until confirmed on real hardware.
const COMMANDS_UNVERIFIED = {
  source_usbc1: Buffer.from([0xF6, 0x30, 0x01, 0x13, 0x3A, 0x6F]),
  source_usbc2: Buffer.from([0xF6, 0x30, 0x01, 0x0C, 0x33, 0x6F]),
};

function checksum(cmd, type, data) {
  // MUST include the 0xF6 head byte — this was the bug in the original draft.
  return (0xF6 + cmd + type + data) & 0xFF;
}

function buildVolumeCommand(vol) {
  vol = Math.max(0, Math.min(100, vol));
  const cmd = 0x0C, type = 0x01;
  return Buffer.from([0xF6, cmd, type, vol, checksum(cmd, type, vol), 0x6F]);
}

function buildContrastCommand(val) {
  val = Math.max(0, Math.min(100, val));
  const cmd = 0x34, type = 0x04;
  return Buffer.from([0xF6, cmd, type, val, checksum(cmd, type, val), 0x6F]);
}

function buildBrightnessCommand(val) {
  val = Math.max(0, Math.min(100, val));
  const cmd = 0x34, type = 0x06;
  return Buffer.from([0xF6, cmd, type, val, checksum(cmd, type, val), 0x6F]);
}

/**
 * Send a command to a panel and return the response buffer (often empty —
 * many commands intentionally have no response, see COMMANDS above).
 */
function sendCommand(ip, cmdOrName, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const cmd = typeof cmdOrName === "string"
      ? (COMMANDS[cmdOrName] || COMMANDS_UNVERIFIED[cmdOrName])
      : cmdOrName;
    if (!cmd) return reject(new Error(`Unknown command: ${cmdOrName}`));

    const socket = new net.Socket();
    let responseData = Buffer.alloc(0);
    let resolved = false;

    const done = (err) => {
      if (resolved) return;
      resolved = true;
      socket.destroy();
      err ? reject(err) : resolve(responseData);
    };

    socket.setTimeout(timeoutMs);
    socket.connect(5000, ip, () => {
      socket.write(cmd);
      setTimeout(() => socket.end(), 600); // wait window for a response
    });

    socket.on("data", (data) => {
      responseData = Buffer.concat([responseData, data]);
    });
    socket.on("end", () => done(null));
    socket.on("timeout", () => done(new Error(`Timeout connecting to ${ip}:5000`)));
    socket.on("error", (err) => done(err));
  });
}

function parsePowerStatus(buf) {
  if (!buf || buf.length < 2) return "unknown";
  const map = { 0x01: "on", 0x02: "standby", 0x03: "sleep" };
  return map[buf[buf.length - 2]] || "unknown";
}

function parseVolume(buf) {
  if (!buf || buf.length < 2) return 0;
  return buf[buf.length - 2];
}

function parseMuteStatus(buf) {
  if (!buf || buf.length < 2) return false;
  return buf[buf.length - 2] === 0x01;
}

/**
 * Frame: F6 [cmd] [type] [ascii data...] [checksum] 6F
 * Strip 3 header bytes AND the checksum + terminator (not just the terminator).
 */
function parseAscii(buf) {
  if (!buf || buf.length < 5) return "";
  return buf.slice(3, buf.length - 2).toString("ascii").replace(/\x00/g, "").trim();
}

module.exports = {
  COMMANDS, COMMANDS_UNVERIFIED,
  sendCommand, buildVolumeCommand, buildContrastCommand, buildBrightnessCommand,
  parsePowerStatus, parseVolume, parseMuteStatus, parseAscii,
};

// On-site test harness — run directly against a real panel:
//   node promethean.js 172.21.65.212 get_power
//   node promethean.js 172.21.65.212 volume_set 50
if (require.main === module) {
  const [ip, name, value] = process.argv.slice(2);
  if (!ip || !name) {
    console.log("Usage: node promethean.js <panel_ip> <command> [value]");
    console.log("Known commands:", Object.keys(COMMANDS).join(", "));
    process.exit(1);
  }

  const run = async () => {
    let cmd, resp;
    if (name === "volume_set") {
      cmd = buildVolumeCommand(parseInt(value, 10));
      console.log("Sending frame:", cmd.toString("hex").toUpperCase());
      resp = await sendCommand(ip, cmd);
    } else {
      const c = COMMANDS[name] || COMMANDS_UNVERIFIED[name];
      console.log("Sending frame:", c.toString("hex").toUpperCase());
      resp = await sendCommand(ip, name);
    }

    console.log("Response:", resp.length ? resp.toString("hex").toUpperCase() : "(no response)");

    if (["get_power", "get_power_v2"].includes(name)) console.log("-> Power status:", parsePowerStatus(resp));
    else if (name === "get_volume") console.log("-> Volume:", parseVolume(resp));
    else if (name === "get_mute") console.log("-> Muted:", parseMuteStatus(resp));
    else if (["get_firmware", "get_touch_fw", "get_touch_serial", "get_serial", "get_model"].includes(name))
      console.log("-> Value:", parseAscii(resp));
  };

  run().catch((err) => {
    console.error("Error:", err.message);
    process.exit(1);
  });
}
