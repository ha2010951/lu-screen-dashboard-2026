require("dotenv").config();

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