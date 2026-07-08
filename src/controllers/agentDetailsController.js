const User = require("../models/User");
const { getAllAgents, getAgentById, updateAgent } = require("../services/sharyxVoiceService");


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
exports.updateAgentDetails = async (req, res) => {
  try {
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

    let current;
    try {
      current = await getAgentById(matchedAgent.id);
    } catch (error) {
      return res.status(502).json({ success: false, stage: "agent_detail", message: error.message });
    }
    if (!current) {
      return res.status(404).json({ success: false, stage: "agent_detail", message: "Agent details not found" });
    }

    const editable = req.body;

    const payload = {
      name: current.name,
      description: editable.description ?? current.description,
      language: current.language,
      phone: current.phone,
      webcall_provider_id: current.webcall_provider_id || "",
      is_draft: current.is_draft,
      is_template: current.is_template,
      voiceclone_id: current.voiceclone_id,
      goal: current.goal,
      sales_script: current.sales_script || "",
      system_prompt: editable.system_prompt ?? current.system_prompt,
      welcome_message: editable.welcome_message ?? current.welcome_message,
      silent_message: editable.silent_message ?? current.silent_message,
      silent_duration: editable.silent_duration ?? current.silent_duration,
      tts_provider_id: current.agent_tts?.[0]?.provider_id,
      tts_config: current.agent_tts?.[0]?.config,
      tts_model: current.agent_tts?.[0]?.model,
      tts_voice_id: current.agent_tts?.[0]?.voice_id,
      background_sound: current.agent_tts?.[0]?.background_sound || "off",
      background_sound_url: current.agent_tts?.[0]?.background_sound_url || "",
      llm_provider_id: current.agent_llm?.[0]?.provider_id,
      llm_config: current.agent_llm?.[0]?.config,
      first_message_mode: current.first_message_mode,
      first_message: current.first_message || "",
      objective: editable.objective ?? current.objective,
      llm_model: current.agent_llm?.[0]?.model,
      llm_provider: current.agent_llm?.[0]?.provider?.name,
      model: current.agent_llm?.[0]?.model,
      stt_provider_id: current.agent_stt?.[0]?.provider_id,
      stt_config: current.agent_stt?.[0]?.config,
      stt_model: current.agent_stt?.[0]?.model,
      llm_api_key_set: current.agent_llm?.[0]?.api_key_set ?? "false",
      llm_api_key: null,
      tts_api_key_set: current.agent_tts?.[0]?.api_key_set ?? "false",
      tts_api_key: null,
      stt_api_key_set: current.agent_stt?.[0]?.api_key_set ?? "false",
      stt_api_key: null,
      prompt: current.postcall?.[0]?.prompt,
      type: current.postcall?.[0]?.type,
      fixed_message: current.postcall?.[0]?.fixed_message,
      dynamic_message: current.postcall?.[0]?.dynamic_message,
      uninterrupt_reason: current.postcall?.[0]?.uninterrupt_reason || [],
      post_webhook_url: current.postcall?.[0]?.webhook_url,
      post_method: current.postcall?.[0]?.method,
      post_headers: current.postcall?.[0]?.headers,
      post_body: current.postcall?.[0]?.body,
      post_timeout: current.postcall?.[0]?.request_timeout,
      precall_model: "",
      precall_prompt: "",
      precall_api_key_set: "false",
      precall_api_key: null,
      is_pre_call_api: false,
      api_url: "",
      method: "",
      header: "",
      body: "",
      response: null,
      parameter: {},
      context_schema: [],
      conversation_enable: current.agent_conversation_history?.[0]?.is_enabled ?? false,
      no_of_conversation: current.agent_conversation_history?.[0]?.number_of_conversations ?? "",
      conversation_type: current.agent_conversation_history?.[0]?.conversation_type ?? "",
      exclude_outcome: current.agent_conversation_history?.[0]?.exclude_by_outcome || [],
      amd_enabled: current.amd_enabled ?? false,
      voicemail_message: current.voicemail_message || "",
      history_enabled: current.agent_conversation_history?.[0]?.is_enabled ?? false,
      history_number_of_conversations: current.agent_conversation_history?.[0]?.number_of_conversations ?? 3,
      history_lookback_period: current.agent_conversation_history?.[0]?.lookback_period ?? 30,
      history_conversation_type: current.agent_conversation_history?.[0]?.conversation_type ?? "summary",
      history_exclude_by_outcome: current.agent_conversation_history?.[0]?.exclude_by_outcome || [],
      pronunciation_id: current.pronunciation_id,
      pronunciation_ids: current.pronunciation_ids || [],
      interruption_enabled: current.interruption_enabled,
      interruption_sensitivity: current.interruption_sensitivity,
      start_secs: parseFloat(current.interruption_speech_duration ?? 0.5),
      stop_secs: parseFloat(current.interruption_stop_secs ?? 0.6),
      confidence: parseFloat(current.interruption_voice_detection_sensitivity ?? 0.5),
      min_volume: parseFloat(current.interruption_min_volume ?? 0.5),
      min_words_enabled: current.min_words_enabled,
      min_words: current.min_words,
      stt_waiting_time_enabled: current.stt_waiting_time_enabled,
      stt_waiting_time_sensitivity: current.stt_waiting_time_sensitivity,
      stt_user_speech_timeout: current.stt_user_speech_timeout,
      stt_user_turn_stop_timeout: current.stt_user_turn_stop_timeout,
      analyticsData: current.analytics_agent?.[0],
    };

    let updated;
    try {
      updated = await updateAgent(matchedAgent.id, payload);
    } catch (error) {
      return res.status(502).json({ success: false, stage: "agent_update", message: error.message });
    }

    res.json({ success: true, agent: updated });
  } catch (error) {
    res.status(500).json({ success: false, stage: "unknown", message: error.message });
  }
};