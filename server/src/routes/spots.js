const express = require("express");
const pool = require("../db");

const router = express.Router();

// GET all public spots
router.get("/", async (req, res) => {
  try {
    const { spot_type, mine, is_public, sort } = req.query;
    const user_id = req.query.user_id ? parseInt(req.query.user_id) : null;

    let conditions = ["spots.is_public = true"];
    const values = [];
    let paramIndex = 1;

    if (spot_type) {
      conditions.push(`spots.spot_type = $${paramIndex++}`);
      values.push(spot_type);
    }

    if (mine === "true" && user_id) {
      conditions = [`spots.user_id = $${paramIndex++}`];
      values.push(user_id);
    }

    if (is_public === "false" && user_id) {
      conditions = [
        `spots.user_id = $${paramIndex++}`,
        `spots.is_public = false`,
      ];
      values.push(user_id);
    }

    const orderBy =
      sort === "oldest" ? "spots.created_at ASC" : "spots.created_at DESC";

    const query = `
      SELECT spots.*, users.username
      FROM spots
      LEFT JOIN users ON spots.user_id = users.id
      WHERE ${conditions.join(" AND ")}
      ORDER BY ${orderBy}
    `;

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch spots" });
  }
});

// POST a new spot
router.post("/", async (req, res) => {
  const {
    title,
    description,
    latitude,
    longitude,
    spot_type,
    is_public,
    user_id,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO spots (user_id, title, description, latitude, longitude, spot_type, is_public)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        user_id,
        title,
        description,
        latitude,
        longitude,
        spot_type,
        is_public ?? true,
      ],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create spot" });
  }
});

module.exports = router;
