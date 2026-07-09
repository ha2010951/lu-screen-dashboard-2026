// Explicit path: the single .env lives at the repo root, two levels up
// from backend/src/ — without this, dotenv only finds it when the
// process happens to be launched with cwd == repo root (e.g. it silently
// misses PORT/PG_* when run via `cd backend && npm run dev`).
require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });

const express = require("express");
const cors = require("cors");
const panelsRoutes = require("./routes/panels");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    message: "Backend API is running",
    time: new Date()
  });
});

app.use("/api/panels", panelsRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});