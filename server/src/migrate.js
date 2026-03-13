const pool = require("./db");
const fs = require("fs");
const path = require("path");

const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");

pool.query(sql, (err) => {
  if (err) {
    console.error("Migration failed:", err);
  } else {
    console.log("Schema created successfully!");
  }
  pool.end();
});
