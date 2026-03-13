const express = require("express");
const pool = require("../db");

const router = express.Router();

// GET all public spots
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT spots.*, users.username 
       FROM spots 
       LEFT JOIN users ON spots.user_id = users.id
       WHERE spots.is_public = true
       ORDER BY spots.created_at DESC`,
    );
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
