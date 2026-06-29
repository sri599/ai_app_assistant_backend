const express = require("express");

const router = express.Router();

const billingController = require("../controllers/billingController");
const auth = require("../middleware/authMiddleware");

/*
|--------------------------------------------------------------------------
| Billing Settings
|--------------------------------------------------------------------------
*/

// Create/Update billing settings
router.post(
  "/settings",
  auth,
  billingController.saveBillingSettings
);

// Get current billing settings
router.get(
  "/settings",
  auth,
  billingController.getBillingSettings
);
router.put(
  "/settings",
  auth,
  billingController.saveBillingSettings
);

/*
|--------------------------------------------------------------------------
| Billing Summary
|--------------------------------------------------------------------------
*/

// Logged-in user's bill
router.get(
  "/my-summary",
  auth,
  billingController.getMyBillingSummary
);

// Admin - specific user's bill
router.get(
  "/summary/:userId",
  auth,
  billingController.getUserBillingSummary
);
router.get(
  "/summary",
  auth,
  billingController.getAllUsersBillingSummary
);

module.exports = router;