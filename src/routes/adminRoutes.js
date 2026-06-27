const express = require("express");

const router = express.Router();

const adminController = require("../controllers/adminController");

const authMiddleware = require("../middleware/authMiddleware");

const adminMiddleware = require("../middleware/adminMiddleware");
router.delete(
  "/users/:id",
  authMiddleware,
  adminMiddleware,
  adminController.deleteUser
);

router.patch(
  "/users/restore/:id",
  authMiddleware,
  adminMiddleware,
  adminController.restoreUser
);
router.patch(
  "/ai-number/free/:id",
  authMiddleware,
  adminMiddleware,
  adminController.makeAiNumberFree
);
router.post(
  "/ai-number/swap",
  authMiddleware,
  adminMiddleware,
  adminController.swapAiNumbers
);

router.get(
  "/users/deleted",
  authMiddleware,
  adminMiddleware,
  adminController.getDeletedUsers
);

router.post(
  "/create",
  adminController.createAdmin
);
router.post(
  "/ai-number",
  authMiddleware,
  adminMiddleware,
  adminController.addAiNumber
);
router.get(
  "/ai-numbers",
  authMiddleware,
  adminMiddleware,
  adminController.getAiNumbers
);
router.get(
  "/dashboard",
  authMiddleware,
  adminMiddleware,
  adminController.dashboard
);

router.get(
  "/users",
  authMiddleware,
  adminMiddleware,
  adminController.getUsers
);

router.get(
  "/users/:id",
  authMiddleware,
  adminMiddleware,
  adminController.getUserById
);

router.post(
  "/assign-ai-number",
  authMiddleware,
  adminMiddleware,
  adminController.assignAiNumber
);

router.get(
  "/admins",
  authMiddleware,
  adminMiddleware,
  adminController.getAdmins
);
router.delete(
  "/ai-number/:id",
  authMiddleware,
  adminMiddleware,
  adminController.deleteAiNumber
);

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  adminController.deleteAdmin
);
router.put(
  "/ai-number/:id/price",
  authMiddleware,
  adminMiddleware,
  adminController.updateAiNumberPrice
);
router.get(
"/payments",
authMiddleware,
adminMiddleware,
adminController.getAllPayments
);

router.get(
"/payments/:id",
authMiddleware,
adminMiddleware,
adminController.getPaymentById
);

router.get(
"/payments/user/:userId",
authMiddleware,
adminMiddleware,
adminController.getPaymentsByUser
);

router.put(
"/payments/:id/status",
authMiddleware,
adminMiddleware,
adminController.updatePaymentStatus
);

router.delete(
"/payments/:id",
authMiddleware,
adminMiddleware,
adminController.deletePayment
);

module.exports = router;