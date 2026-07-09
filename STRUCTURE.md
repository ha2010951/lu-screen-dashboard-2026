# Project Structure — LU Screen Dashboard

Backend for controlling Promethean ActivPanel screens (classroom displays)
over RS-232-over-TCP/IP, backed by Postgres, exposed via an Express API.
This doc is a map of the repo for onboarding — not a source of truth for
implementation details (read the code/comments for that).

```
lu-screen-dashboard-2026/
├── README.md
├── TASK_SPLIT.md
├── STRUCTURE.md
├── .env.example
├── .gitignore
├── src/                      (empty, unused — see note below)
└── backend/
    ├── Dockerfile
    ├── package.json
    ├── package-lock.json
    └── src/
        ├── index.js
        ├── db.js
        ├── test-db.js
        ├── promethean.js
        └── routes/
            └── panels.js
```

## Root

- **README.md** — placeholder, essentially empty. Not yet written.
- **TASK_SPLIT.md** — the original 3-way task split for the interns who
  built this (Person A: hardware/`promethean.js`, Person B: DB layer,
  Person C: HTTP/API layer). Useful for understanding *why* the code is
  divided the way it is and which contracts exist between the pieces.
- **.env.example** — template for the real `.env` file (never committed).
  Documents every env var the backend expects: Postgres connection,
  Evolution API (WhatsApp), Groq, WAHA, server port/JWT secret.
- **.gitignore** — standard ignore rules (`.env`, `node_modules/`, logs,
  editor/OS files).
- **src/** — empty leftover directory at the repo root. Not used by
  anything; all real backend code lives under `backend/src/`. Safe to
  ignore or delete.

## backend/

The actual Node.js/Express backend. This is the only app in the repo
right now (no frontend yet).

- **Dockerfile** — container build for the backend service.
- **package.json** — dependencies: `express`, `pg` (Postgres client),
  `cors`, `dotenv`; dev dependency `nodemon`. Scripts: `npm run dev`
  (nodemon) / `npm start` (node).

### backend/src/

- **index.js** — Express app entry point. Loads `.env`, wires up `cors`
  and JSON body parsing, exposes `GET /api/health`, and mounts the panels
  router at `/api/panels`. Starts listening on `PORT` (default 4000).

- **db.js** — the single shared `pg` Pool for the app. Reads connection
  config from `.env` (`PG_HOST`, `PG_PORT`, `PG_USER`, `PG_PASSWORD`,
  `PG_DATABASE`). Exports the pool directly; contract is
  `pool.query(sql, params) -> Promise<{ rows: [...] }>`. Doesn't know
  about Express routes or panel command logic — pure data layer.

- **test-db.js** — one-off manual script (not a route, not imported
  elsewhere) to confirm the DB connection works and to inspect the real
  columns on the `panels` / `panel_status` tables. Meant to be deleted
  once that's confirmed.

- **promethean.js** — owns raw TCP socket communication with the
  physical Promethean screens (RS-232 protocol tunneled over TCP/IP).
  Doesn't know about Postgres or Express. Exports:
  - `sendCommand(ip, cmdOrName, timeoutMs)` — sends a named/raw command
    buffer to a panel, returns the raw response `Buffer`.
  - `buildVolumeCommand/buildContrastCommand/buildBrightnessCommand(val)`
    — build the correct command frame for a given value.
  - `parsePowerStatus/parseVolume/parseMuteStatus/parseAscii(buf)` —
    decode a response buffer into a usable value.
  - `COMMANDS` — known-good command frames (power, volume, mute, source
    select, freeze, firmware/serial/model queries).
  - `COMMANDS_UNVERIFIED` — commands flagged as not yet confirmed on
    real hardware (currently just USB-C source select).
  - Also runnable directly as a CLI test harness:
    `node promethean.js <panel_ip> <command> [value]`.

- **routes/panels.js** — Express router mounted at `/api/panels`.
  Currently returns **hardcoded fake panel data** (not yet wired to
  `db.js` or `promethean.js`):
  - `GET /api/panels` — list all panels.
  - `POST /api/panels/:id/command` — send a command to one panel.
  - `POST /api/panels/command/room` — broadcast a command to all panels
    in a room.

## Known gaps / in-progress work (from TASK_SPLIT.md)

- `poller.js` (DB layer) — not yet created. Should loop every 30s over
  `panels`, call `promethean.sendCommand()` per panel, and write results
  into `panel_status` via `db.js`.
- `routes/panels.js` still uses fake in-memory data — needs to be swapped
  over to real `db.js` queries once the poller is confirmed working.
- USB-C source command codes in `promethean.js` are unverified against
  real hardware.
