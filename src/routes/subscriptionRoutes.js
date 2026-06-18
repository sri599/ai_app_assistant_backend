const express = require("express");

const router = express.Router();

const authMiddleware = require(
  "../middleware/authMiddleware"
);

const subscriptionController =
  require(
    "../controllers/subscriptionController"
  );

router.get(
  "/plans",
  subscriptionController.getPlans
);

router.post(
  "/activate",
  authMiddleware,
  subscriptionController.activateSubscription
);

router.get(
  "/current",
  authMiddleware,
  subscriptionController.getCurrentSubscription
);

router.get(
  "/history",
  authMiddleware,
  subscriptionController.subscriptionHistory
);

module.exports = router;