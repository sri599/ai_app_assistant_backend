const express = require("express");
const router = express.Router();

const {
  getAgentDetails,
  updateAgentDetails,
  switchAgentLanguage,
  getAgentConfigurationOptions,
  updateAgentConfiguration,
} = require("../controllers/agentDetailsController");

const auth = require("../middleware/authMiddleware");

// ======================
// User Routes
// ======================

// Get current agent
router.get("/me", auth, getAgentDetails);

// Update normal agent fields
router.put("/me", auth, updateAgentDetails);

// Switch language
router.put("/me/language", auth, switchAgentLanguage);

// Get all editable configuration options
router.get("/config/options", auth, getAgentConfigurationOptions);

// Update agent configuration (Name, Age, Personality, Tone, etc.)
router.put("/me/config", auth, updateAgentConfiguration);

// ======================
// Admin Routes
// Keep parameter routes LAST
// ======================

// Get agent for a user
router.get("/:userId", auth, getAgentDetails);

// Update normal agent fields
router.put("/:userId", auth, updateAgentDetails);

// Switch language
router.put("/:userId/language", auth, switchAgentLanguage);

// Update agent configuration for a user
router.put("/:userId/config", auth, updateAgentConfiguration);

module.exports = router;