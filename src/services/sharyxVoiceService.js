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
    return res.data?.AddtionalData;
  } catch (error) {
    if (error.response?.status === 401) {
      cachedToken = null;
      throw new Error("VOICE_TOKEN_EXPIRED");
    }
    throw new Error("VOICE_UPDATE_FAILED");
  }
}

module.exports = { getAllAgents, getAgentById, updateAgent };