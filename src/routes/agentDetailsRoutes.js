const express = require("express");
const router = express.Router();
const { getAgentDetails } = require("../controllers/agentDetailsController");
const auth = require("../middleware/authMiddleware");
router.get("/me", auth, getAgentDetails);          // user: own agent
router.get("/:userId", auth, getAgentDetails);     // admin: agent for a given userId

module.exports = router;