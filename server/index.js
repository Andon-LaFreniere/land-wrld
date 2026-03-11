// server/index.js
const express = require("express");
const cors = require("cors"); // You'll need this to let React talk to Node
const db = require("./src/db");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Allows requests from your React app
app.use(express.json()); // Allows the server to read JSON in request bodies

// A simple test route
app.get("/api/health", (req, res) => {
  res.json({ status: "Server is running and healthy" });
});

app.get("/api/points", async (req, res) => {
  try {
    // We use ST_AsGeoJSON to convert the geometry column into a JSON string
    const result = await db.query(`
      SELECT id, title, notes, ST_AsGeoJSON(geom) as geometry 
      FROM user_points 
      WHERE is_public = TRUE
    `);

    // Parse the geometry string back into an object before sending
    const points = result.rows.map((row) => ({
      ...row,
      geometry: JSON.parse(row.geometry),
    }));

    res.json(points);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database query failed" });
  }
});

// POST a new point to the database
app.post("/api/points", async (req, res) => {
  const { user_id, title, notes, lng, lat } = req.body;

  try {
    const query = `
      INSERT INTO user_points (user_id, title, notes, geom)
      VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326))
      RETURNING *;
    `;
    const values = [user_id, title, notes, lng, lat];
    const result = await db.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save point" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
