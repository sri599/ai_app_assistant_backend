const express = require("express");

const router = express.Router();

const auth = require("../middleware/authMiddleware");

const invoiceController = require("../controllers/invoiceController");


// Admin
router.post(
  "/generate/:userId",
  auth,
  invoiceController.generateInvoice
);

router.get(
  "/",
  auth,
  invoiceController.getAllInvoices
);

router.put(
  "/pay/:id",
  auth,
  invoiceController.markInvoicePaid
);

router.put(
  "/cancel/:id",
  auth,
  invoiceController.cancelInvoice
);


// User
router.get(
  "/my",
  auth,
  invoiceController.getMyInvoices
);


// Common
router.get(
  "/:id",
  auth,
  invoiceController.getInvoiceById
);

module.exports = router;