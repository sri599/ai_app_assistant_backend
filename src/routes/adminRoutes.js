const express = require("express");

const router = express.Router();

const adminController = require("../controllers/adminController");

const authMiddleware = require("../middleware/authMiddleware");

const adminMiddleware = require("../middleware/adminMiddleware");

router.post(
  "/create",
  adminController.createAdmin
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
  "/:id",
  authMiddleware,
  adminMiddleware,
  adminController.deleteAdmin
);

module.exports = router;