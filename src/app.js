const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const subscriptionRoutes = require(
  "./routes/subscriptionRoutes"
);
const adminRoutes = require(
  "./routes/adminRoutes"
);
const aiNumberRoutes =
  require(
    "./routes/aiNumberRoutes"
  );
  const callLogRoutes =
  require("./routes/callLogRoutes");
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AI Call Assistant API Running",
  });
});


app.use(
  "/api/admin",
  adminRoutes
);

app.use("/api/auth", authRoutes);
app.use(
  "/api/subscription",
  subscriptionRoutes
);

app.use(
  "/api/ai-numbers",
  aiNumberRoutes
);


app.use(
  "/api/call-logs",
  callLogRoutes
);
module.exports = app;