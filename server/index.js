const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
//add comment to force redeploy
app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = [
        process.env.CLIENT_URL,
        /https:\/\/land-wrld.*\.vercel\.app$/,
      ];
      if (
        !origin ||
        allowed.some((a) =>
          typeof a === "string" ? a === origin : a.test(origin),
        )
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  }),
);
app.use(express.json());

const authRoutes = require("./src/routes/auth");
const spotsRoutes = require("./src/routes/spots");

app.use("/api/auth", authRoutes);
app.use("/api/spots", spotsRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
