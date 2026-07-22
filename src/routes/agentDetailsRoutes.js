const express = require("express");
const router = express.Router();

const {
  getAgentDetails,
  updateAgentDetails,
  switchAgentLanguage,
  getAgentPersonalities,
  switchAgentPersonality,
} = require("../controllers/agentDetailsController");

const auth = require("../middleware/authMiddleware");

// ======================
// User Routes
// ======================

router.get("/me", auth, getAgentDetails);
router.put("/me", auth, updateAgentDetails);

router.put("/me/language", auth, switchAgentLanguage);

router.get("/personalities", auth, getAgentPersonalities);

router.put("/me/personality", auth, switchAgentPersonality);

// ======================
// Admin Routes
// Keep parameter routes LAST
// ======================

router.get("/:userId", auth, getAgentDetails);
router.put("/:userId", auth, updateAgentDetails);
router.put("/:userId/language", auth, switchAgentLanguage);

module.exports = router;