const express = require("express");
const router = express.Router();
const {
  getAgentDetails,
  updateAgentDetails,
  switchAgentLanguage,
} = require("../controllers/agentDetailsController");
const auth = require("../middleware/authMiddleware");

router.get("/me", auth, getAgentDetails);          // user: own agent
router.get("/:userId", auth, getAgentDetails);     // admin: agent for a given userId

router.put("/me", auth, updateAgentDetails);
router.put("/:userId", auth, updateAgentDetails);

router.put("/me/language", auth, switchAgentLanguage);        // user: switch own agent's language
router.put("/:userId/language", auth, switchAgentLanguage);   // admin: switch agent's language for a given userId

module.exports = router;