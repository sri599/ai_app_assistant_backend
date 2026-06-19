const express = require("express");

const router =
  express.Router();

const authMiddleware =
  require(
    "../middleware/authMiddleware"
  );

const aiNumberController =
  require(
    "../controllers/aiNumberController"
  );

router.get(
  "/free",
  authMiddleware,
  aiNumberController.freeNumbers
);

router.get(
  "/my",
  authMiddleware,
  aiNumberController.myNumber
);

router.post(
  "/assign",
  authMiddleware,
  aiNumberController.assignNumber
);

router.post(
  "/change",
  authMiddleware,
  aiNumberController.changeNumber
);

router.post(
  "/release",
  authMiddleware,
  aiNumberController.releaseNumber
);

module.exports = router;