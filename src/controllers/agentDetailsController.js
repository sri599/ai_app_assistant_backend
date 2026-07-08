const User = require("../models/User");
const { getAllAgents, getAgentById } = require("../services/sharyxVoiceService");

exports.getAgentDetails = async (req, res) => {
  try {
    // admin can pass ?userId=xxx, otherwise use logged-in user
    const targetUserId = req.params.userId || req.userId;

    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({ success: false, stage: "user_lookup", message: "User not found" });
    }

    if (!user.aiNumber) {
      return res.status(400).json({ success: false, stage: "user_lookup", message: "No AI number assigned to this user" });
    }

    const last4 = user.aiNumber.slice(-4);

    let agents;
    try {
      agents = await getAllAgents();
    } catch (error) {
      return res.status(502).json({ success: false, stage: "agent_list", message: error.message });
    }

    const matchedAgent = agents?.find((a) => a.name?.startsWith(`${last4}-`));
    if (!matchedAgent) {
      return res.status(404).json({ success: false, stage: "agent_match", message: `No agent found for number ending ${last4}` });
    }

    let agentDetails;
    try {
      agentDetails = await getAgentById(matchedAgent.id);
    } catch (error) {
      return res.status(502).json({ success: false, stage: "agent_detail", message: error.message });
    }

    if (!agentDetails) {
      return res.status(404).json({ success: false, stage: "agent_detail", message: "Agent details not found" });
    }

    res.json({ success: true, agent: agentDetails });
  } catch (error) {
    res.status(500).json({ success: false, stage: "unknown", message: error.message });
  }
};