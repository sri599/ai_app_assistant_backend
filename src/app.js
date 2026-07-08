const express = require("express");
const cors = require("cors");
const paymentRoutes = require("./routes/paymentRoutes");
const authRoutes = require("./routes/authRoutes");
const billingRoutes = require("./routes/billingRoutes");
const agentDetailsRoutes = require("./routes/agentDetailsRoutes");
const invoiceRoutes =
require("./routes/invoiceRoutes");
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
  const invoiceSettlementRoutes=require(
"./routes/invoiceSettlementRoutes"
);
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
  "/api/billing",
  billingRoutes
);

app.use(
  "/api/payment",
  paymentRoutes
);
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
app.use(
    "/api/invoices",
    invoiceRoutes
);
app.use(

"/api/invoice-settlement",

invoiceSettlementRoutes

);
app.use("/api/agent-details", agentDetailsRoutes);
module.exports = app;