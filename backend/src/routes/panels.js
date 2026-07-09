const express = require("express");
const router = express.Router();

const panels = [
  {
    id: 1,
    name: "Lab 3 - Screen A",
    room: "Lab 3",
    building: "MB2",
    ip_address: "192.168.1.101",
    power: "on",
    volume: 40,
    muted: false,
    source: "HDMI1"
  },
  {
    id: 2,
    name: "Lab 3 - Screen B",
    room: "Lab 3",
    building: "MB2",
    ip_address: "192.168.1.102",
    power: "standby",
    volume: 30,
    muted: false,
    source: "HDMI2"
  }
];

router.get("/", (req, res) => {
  res.json(panels);
});

router.post("/:id/command", (req, res) => {
  const panelId = Number(req.params.id);
  const { command, value } = req.body;

  const panel = panels.find(p => p.id === panelId);

  if (!panel) {
    return res.status(404).json({
      ok: false,
      error: "Panel not found"
    });
  }

  res.json({
    ok: true,
    message: "Fake command received successfully",
    panel,
    command,
    value: value || null
  });
});

router.post("/command/room", (req, res) => {
  const { room, command, value } = req.body;

  const roomPanels = panels.filter(
    p => p.room.toLowerCase() === room.toLowerCase()
  );

  res.json({
    ok: true,
    message: "Fake room command received successfully",
    room,
    command,
    value: value || null,
    total: roomPanels.length,
    panels: roomPanels
  });
});

module.exports = router;