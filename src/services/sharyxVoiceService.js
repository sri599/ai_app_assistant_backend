const axios = require("axios");

const BASE_URL = "https://voice.sharyx.ai/api";
const LOGIN_EMAIL = "srinathjaya97@gmail.com";
const LOGIN_PASSWORD = "Login123!!";

let cachedToken = null;
let cachedTokenExpiry = 0;

async function getVoiceToken() {
  if (cachedToken && Date.now() < cachedTokenExpiry) return cachedToken;

  let response;
  try {
    response = await axios.post(`${BASE_URL}/auth/login`, {
      email: LOGIN_EMAIL,
      password: LOGIN_PASSWORD,
    });
  } catch (error) {
    throw new Error("VOICE_LOGIN_FAILED");
  }

  const setCookie = response.headers["set-cookie"];
  const tokenCookie = setCookie?.find((c) => c.startsWith("token="));
  if (!tokenCookie) throw new Error("VOICE_LOGIN_NO_TOKEN");

  cachedToken = tokenCookie.split("token=")[1].split(";")[0];
  cachedTokenExpiry = Date.now() + 6 * 24 * 60 * 60 * 1000; // ~6 days
  return cachedToken;
}

async function callWithToken(url) {
  const token = await getVoiceToken();
  try {
    const res = await axios.get(url, { headers: { Cookie: `token=${token}` } });
    return res.data?.AddtionalData;
  } catch (error) {
    if (error.response?.status === 401) {
      cachedToken = null; // force re-login next call
      throw new Error("VOICE_TOKEN_EXPIRED");
    }
    throw new Error("VOICE_API_FAILED");
  }
}

const getAllAgents = () => callWithToken(`${BASE_URL}/agent/list`);
const getAgentById = (agentId) => callWithToken(`${BASE_URL}/agent/byid/${agentId}`);

async function updateAgent(agentId, fullPayload) {
  const token = await getVoiceToken();
  try {
    const res = await axios.put(
      `${BASE_URL}/agent/update/${agentId}`,
      fullPayload,
      { headers: { Cookie: `token=${token}` } }
    );

    // TEMP: log the raw shape so we can see exactly what Sharyx returns.
    console.log("Sharyx updateAgent raw response:", JSON.stringify(res.data));

    if (res.data?.AddtionalData) {
      return res.data.AddtionalData;
    }
    // Some Sharyx endpoints return the object directly instead of
    // wrapping it in AddtionalData — fall back to that shape too.
    if (res.data && typeof res.data === "object" && res.data.id) {
      return res.data;
    }
    // Update endpoint didn't return the updated agent at all — refetch
    // it explicitly so callers always get a real agent object back.
    return await getAgentById(agentId);
  } catch (error) {
    if (error.response?.status === 401) {
      cachedToken = null;
      throw new Error("VOICE_TOKEN_EXPIRED");
    }
    throw new Error("VOICE_UPDATE_FAILED");
  }
}
/**
 * GET /admin/providers
 * The response shape here differs from other endpoints — it's not
 * wrapped in AddtionalData, it's a raw array (per the sample you shared).
 * Unwrap defensively so this keeps working if that ever changes.
 */
async function getAllProviders() {
  const token = await getVoiceToken();
  try {
    const res = await axios.get(`${BASE_URL}/admin/providers`, {
      headers: { Cookie: `token=${token}` },
    });
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.AddtionalData)) return data.AddtionalData;
    if (Array.isArray(data?.providers)) return data.providers;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  } catch (error) {
    if (error.response?.status === 401) {
      cachedToken = null;
      throw new Error("VOICE_TOKEN_EXPIRED");
    }
    throw new Error("VOICE_PROVIDERS_FAILED");
  }
}

module.exports = { getAllAgents, getAgentById, updateAgent, getAllProviders };