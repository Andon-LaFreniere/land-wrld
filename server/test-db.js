const db = require("./src/db");

async function test() {
  try {
    const res = await db.query("SELECT NOW()");
    console.log("Connection Successful! Database time:", res.rows[0].now);
    process.exit(0);
  } catch (err) {
    console.error("Connection Error:", err);
    process.exit(1);
  }
}

test();
