# Backend Task Split — 3 Interns, Zero Overlap

**Language: Node.js** (matches the guide's Dockerfiles, docker-compose
examples, and troubleshooting sections — less translation work, less
mismatch with what the mentor expects). The `promethean.py` script
still works as a quick field-verification tool — keep it for fast
on-site hardware checks if that's easier, but `promethean.js` is what
the real backend depends on.

## Files already done (ready to use, don't rebuild)
- `src/promethean.js` — DONE, tested, checksum bug fixed, verified against
  Dashboard_todo.md's own worked examples (same fix as the Python version,
  confirmed identical output). Ready for on-site testing via:
  `node promethean.js <panel_ip> get_power`

## The split

### Person A — Hardware / on-site testing (whoever's in the classroom)
**Owns:** `src/promethean.js` — already built. Your job now is *verification*,
not writing new code:
1. Run the standalone test harness (`node promethean.js <ip> <command>`)
   against all 3 real panels for every command in COMMANDS, not just the
   ones we already tried.
2. Specifically re-test `volume_set` now that the checksum is fixed —
   confirm it visually lands on the exact value this time.
3. Confirm/deny the USB-C source codes (flagged UNVERIFIED) — select
   USB-C physically on a panel, run `get_source`, record the actual
   response byte back into Dashboard_todo.md.
4. Report back: does `power_on` work over TCP from Standby? From Sleep?
   (this resolves the contradiction with the todo doc — we already
   confirmed it works from Standby)

### Person B — Database layer
**Owns:** `src/db.js` (new) + `src/poller.js` (new)
- Fill in `.env` with the real Postgres password
- Build `db.js`: a `pg` Pool exposing `pool.query(sql, params)`,
  connecting to the same Postgres we already validated via psql/Adminer
- Build `poller.js`: loops every 30s through `SELECT * FROM panels`,
  calls `promethean.sendCommand()` for each, writes result into
  `panel_status` via `pool.query()`
- **Does NOT need to touch real hardware** — can develop against Person
  A's already-tested `promethean.js` functions directly, or against a
  fake/mock IP that always times out, to test the "offline" path

Contract Person B must follow (already defined in promethean.js):
```javascript
sendCommand(ip, cmdOrName, timeoutMs) -> Promise<Buffer>
parsePowerStatus(buf) -> string
parseVolume(buf) -> number
```

### Person C — HTTP / API layer
**Owns:** `src/index.js` (new) + `src/routes/panels.js` (new)
- Build the Express app: `GET /api/panels`, `POST /api/panels/:id/command`,
  `POST /api/panels/command/room`
- **Does NOT need Postgres or real hardware working yet** — build and
  test the routes first using fake/hardcoded return data, matching the
  shape `db.js` and `promethean.js` will eventually provide. Swap in the
  real calls once B and A confirm their pieces work.

Contract Person C can assume (from `db.js`):
```javascript
pool.query(sql, params) -> Promise<{ rows: [...] }>
```

## Sync point (all 3 of you, before merging)
Once A confirms hardware commands work, B confirms the poller writes
real status into `panel_status`, and C's routes work against fake data —
swap C's fake data for real `db.js` calls. This should be a small change
if everyone stuck to the contracts above.

## Rule to avoid stepping on each other
- Each person only edits their own file(s) above.
- If you need to change a function signature another person depends on
  (the contract), say so in the group chat BEFORE changing it — that's
  the one thing that silently breaks someone else's in-progress work.
