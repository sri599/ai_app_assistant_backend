const User = require("../models/User");
const CONFIG_OPTIONS = require('../utils/agentConfigOptions');

const { getAllAgents, getAgentById, updateAgent, getAllProviders } = require("../services/sharyxVoiceService");
const { detectLanguage, presets, sttPreferred, llmPreferred } = require("../utils/agentLanguageDefaults");
const { resolveProvider } = require("../utils/providerResolver");

// --- shared helper: find the sharyx agent that belongs to this user -----
async function findUserAgent(targetUserId) {
  const user = await User.findById(targetUserId);
  if (!user) {
    const err = new Error("User not found");
    err.stage = "user_lookup";
    err.status = 404;
    throw err;
  }
  if (!user.aiNumber) {
    const err = new Error("No AI number assigned to this user");
    err.stage = "user_lookup";
    err.status = 400;
    throw err;
  }

  const last4 = user.aiNumber.slice(-4);

  let agents;
  try {
    agents = await getAllAgents();
  } catch (error) {
    error.stage = "agent_list";
    error.status = 502;
    throw error;
  }

  const matchedAgent = agents?.find((a) => a.name?.startsWith(`${last4}-`));
  if (!matchedAgent) {
    const err = new Error(`No agent found for number ending ${last4}`);
    err.stage = "agent_match";
    err.status = 404;
    throw err;
  }

  let current;
  try {
    current = await getAgentById(matchedAgent.id);
  } catch (error) {
    error.stage = "agent_detail";
    error.status = 502;
    throw error;
  }
  if (!current) {
    const err = new Error("Agent details not found");
    err.stage = "agent_detail";
    err.status = 404;
    throw err;
  }

  return { matchedAgent, current };
}

// --- shared helper: build the full sharyx update payload -----------------
function buildPayload({ current, editable, language, resolvedStt, resolvedLlm }) {
  return {
    name: current.name,
    description: editable.description ?? current.description,
    language,
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
    llm_provider_id: resolvedLlm?.providerId ?? current.agent_llm?.[0]?.provider_id,
    llm_config: current.agent_llm?.[0]?.config,
    first_message_mode: current.first_message_mode,
    first_message: current.first_message || "",
    objective: editable.objective ?? current.objective,
    llm_model: resolvedLlm?.model ?? current.agent_llm?.[0]?.model,
    llm_provider: resolvedLlm?.providerName ?? current.agent_llm?.[0]?.provider?.name,
    model: resolvedLlm?.model ?? current.agent_llm?.[0]?.model,
    stt_provider_id: resolvedStt?.providerId ?? current.agent_stt?.[0]?.provider_id,
    stt_config: current.agent_stt?.[0]?.config,
    stt_model: resolvedStt?.model ?? current.agent_stt?.[0]?.model,
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
}

async function resolveSttLlm(language) {
  let providers = [];
  try {
    providers = await getAllProviders();
  } catch (error) {
    console.warn("Provider fetch failed, keeping existing stt/llm config:", error.message);
    return { resolvedStt: null, resolvedLlm: null };
  }
  const resolvedStt = providers.length
    ? resolveProvider({ providers, type: "stt", language, preferenceMap: sttPreferred })
    : null;
  const resolvedLlm = providers.length
    ? resolveProvider({ providers, type: "llm", language, preferenceMap: llmPreferred })
    : null;
  return { resolvedStt, resolvedLlm };
}

// ---------------------------------------------------------------------

exports.getAgentDetails = async (req, res) => {
  try {
    const targetUserId = req.params.userId || req.userId;
    const { current } = await findUserAgent(targetUserId);
    res.json({ success: true, agent: current });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      stage: error.stage || "unknown",
      message: error.message,
    });
  }
};

exports.updateAgentDetails = async (req, res) => {
  try {
    const targetUserId = req.params.userId || req.userId;
    const { matchedAgent, current } = await findUserAgent(targetUserId);
    const editable = req.body;

    // Language is auto-detected from the text being saved — the regular
    // update endpoint never accepts a manual language switch (use
    // PUT /api/agent-details/me/language for that instead).
    const combinedText = [
      editable.system_prompt ?? current.system_prompt,
      editable.welcome_message ?? current.welcome_message,
      editable.silent_message ?? current.silent_message,
    ].join(" ");
    const language = detectLanguage(combinedText);

    const { resolvedStt, resolvedLlm } = await resolveSttLlm(language);
    const payload = buildPayload({ current, editable, language, resolvedStt, resolvedLlm });

    let updated;
    try {
      updated = await updateAgent(matchedAgent.id, payload);
    } catch (error) {
      return res.status(502).json({ success: false, stage: "agent_update", message: error.message });
    }

    res.json({ success: true, agent: updated });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      stage: error.stage || "unknown",
      message: error.message,
    });
  }
};

exports.switchAgentLanguage = async (req, res) => {
  try {
    const targetUserId = req.params.userId || req.userId;
    const requestedLanguage = req.body?.language;

    if (requestedLanguage !== "English" && requestedLanguage !== "Tamil") {
      return res.status(400).json({
        success: false,
        stage: "validation",
        message: "language must be 'English' or 'Tamil'",
      });
    }

    const { matchedAgent, current } = await findUserAgent(targetUserId);

    const preset = presets[requestedLanguage];
    const editable = {
      system_prompt: preset.prompt,
      welcome_message: preset.welcome,
      silent_message: preset.silent,
      // description, objective, silent_duration intentionally omitted
      // so buildPayload() falls back to whatever's currently saved.
    };

    const { resolvedStt, resolvedLlm } = await resolveSttLlm(requestedLanguage);
    const payload = buildPayload({
      current,
      editable,
      language: requestedLanguage,
      resolvedStt,
      resolvedLlm,
    });

    let updated;
    try {
      updated = await updateAgent(matchedAgent.id, payload);
    } catch (error) {
      return res.status(502).json({ success: false, stage: "agent_update", message: error.message });
    }

    res.json({ success: true, agent: updated });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      stage: error.stage || "unknown",
      message: error.message,
    });
  }
};

exports.getAgentConfigOptions = async (req, res) => {
  res.json({
    success: true,
    options: CONFIG_OPTIONS
  });
};
exports.updateAgentConfiguration = async (req, res) => {
  try {
    const targetUserId = req.params.userId || req.userId;

    const {
      name,
      age,
      role,
      personality,
      tone,
      speakingSpeed,
      energyLevel,
      empathyLevel,
      humorLevel,
      confidenceLevel,
      formality,
      responseLength
    } = req.body;

    const { matchedAgent, current } = await findUserAgent(targetUserId);

    // Personality full text
    const personalityText = personality
      ? PERSONALITIES[personality]?.prompt?.trim() || personality
      : 'Be warm, caring and friendly.';

    const configBlock = `## Agent Configuration

Name:
${name || 'Neya'}

Age:
${age || '28'}

Role:
${role || 'Personal AI Call Assistant'}

Personality:
${personalityText}

Tone:
${tone || 'Friendly and conversational'}

Speaking Speed:
${speakingSpeed || 'Normal'}

Energy Level:
${energyLevel || 'Medium'}

Empathy Level:
${empathyLevel || 'High'}

Confidence:
${confidenceLevel || 'High'}

Humor Level:
${humorLevel || 'Low'}

Formality:
${formality || 'Professional'}

Response Length:
${responseLength || 'Short'}`;

    let updatedPrompt = current.system_prompt || '';

    // Replace existing Agent Configuration block
    const configRegex = /## Agent Configuration\\s*[\\s\\S]*?(?=\\nRole:|\\nLanguage Style Rule|$)/;

    if (configRegex.test(updatedPrompt)) {
      updatedPrompt = updatedPrompt.replace(configRegex, configBlock);
    } else {
      updatedPrompt = `${configBlock}

${updatedPrompt.trim()}`;
    }

    const editable = {
      system_prompt: updatedPrompt
    };

    const payload = buildPayload({
      current,
      editable,
      language: current.language
    });

    const updated = await updateAgent(matchedAgent.id, payload);

    res.json({
      success: true,
      agent: updated
    });

  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      stage: error.stage || 'unknown',
      message: error.message
    });
  }
};