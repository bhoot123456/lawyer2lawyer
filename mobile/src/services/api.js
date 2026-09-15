import { create } from "axios";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

function generateUUID() {
  if (typeof crypto !== "undefined") {
    if (typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    if (typeof crypto.getRandomValues === "function") {
      return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
      );
    }
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ─────────────────────────────────────────────────────────
// API URL configuration
// ─────────────────────────────────────────────────────────
// Production MUST have EXPO_PUBLIC_API_URL set to a real HTTPS
// endpoint (configured via EAS build env vars — see eas.json and
// .env.example). In production builds (__DEV__ === false), we
// never silently fall back to localhost / 127.0.0.1 / 10.0.2.2.

const BASE_URL_RAW =
  process.env.EXPO_PUBLIC_API_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

// Development-only fallbacks (stripped from production bundle by Metro)
const DEV_FALLBACK_ANDROID = "http://10.0.2.2:5000";
const DEV_FALLBACK_DEFAULT = "http://127.0.0.1:5000";

const isWeb = Platform.OS === "web";

function isDevUrl(url) {
  if (!url) return false;
  return (
    url.includes("localhost") ||
    url.includes("127.0.0.1") ||
    url.includes("10.0.2.2") ||
    url.includes("0.0.0.0")
  );
}

function normalizeBaseUrl(u) {
  let url = String(u || "").replace(/\/+$/, "");
  // On Android emulator during development, translate localhost/127.0.0.1 to 10.0.2.2
  if (__DEV__ && Platform.OS === "android") {
    url = url.replace("127.0.0.1", "10.0.2.2").replace("localhost", "10.0.2.2");
  }
  return url;
}

let BASE_URL;

if (__DEV__) {
  // Development: allow localhost / emulator fallbacks for local dev convenience.
  const fallback = Platform.OS === "android" ? DEV_FALLBACK_ANDROID : DEV_FALLBACK_DEFAULT;
  BASE_URL = normalizeBaseUrl(BASE_URL_RAW || fallback);
} else {
  // Production: require an explicit, non-localhost API URL.
  if (!BASE_URL_RAW) {
    throw new Error(
      "PRODUCTION CONFIG ERROR: EXPO_PUBLIC_API_URL is not set. " +
        "Production builds require a valid HTTPS API URL. " +
        "Configure it via the EAS production build profile. See .env.example.",
    );
  }
  if (isDevUrl(BASE_URL_RAW)) {
    throw new Error(
      "PRODUCTION CONFIG ERROR: EXPO_PUBLIC_API_URL is set to a development URL (" +
        BASE_URL_RAW +
        "). Production builds must use an HTTPS API URL (e.g. " +
        "https://api.yourdomain.com/api). Configure the production API URL via " +
        "EAS build environment variables. See .env.example.",
    );
  }
  BASE_URL = normalizeBaseUrl(BASE_URL_RAW);
}

// Backend mounts routes under /api (see backend/index.js)
const clientBaseUrl = BASE_URL.endsWith("/api")
  ? BASE_URL
  : `${BASE_URL}/api`;

const api = create({
  baseURL: clientBaseUrl,
  timeout: 15000, // 15 seconds request timeout to prevent hanging on dropped mobile networks
});

// Helpful during debugging (stripped from production bundle)
if (__DEV__) {
  console.log(
    "[api] EXPO_PUBLIC_API_URL / EXPO_PUBLIC_BACKEND_URL:",
    BASE_URL_RAW || "(using dev fallback)",
  );
  console.log("[api] Using BASE_URL:", api.defaults.baseURL);
}

// ─────────────────────────────────────────────────────────
// Session storage (Phase 1)
// - We keep existing key authToken for access token to avoid breaking existing code.
// - We also store refreshToken to support automatic refresh.
// ─────────────────────────────────────────────────────────
const ACCESS_TOKEN_KEY = "authToken";
const REFRESH_TOKEN_KEY = "refreshToken";

let onSessionClearedCallback = null;

export function registerSessionClearedHandler(fn) {
  onSessionClearedCallback = fn;
}

export async function getAuthToken() {
  return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
}

export async function setAuthToken(token) {
  if (!token) {
    return AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
  }
  return AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export async function getRefreshToken() {
  return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
}

export async function setRefreshToken(token) {
  if (!token) {
    return AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
  }
  return AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export async function clearSession() {
  // Some AsyncStorage builds (or mocks) may not implement multiRemove.
  // Fallback to sequential removals.
  if (typeof AsyncStorage?.multiRemove === "function") {
    await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
  } else {
    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  if (typeof onSessionClearedCallback === "function") {
    try {
      onSessionClearedCallback();
    } catch {
      // ignore
    }
  }
}

// Attach Authorization header for protected routes
api.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  const deviceId = await getDeviceId();
  
  config.headers = config.headers || {};
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  if (deviceId) {
    config.headers["X-Device-Id"] = deviceId;
  }

  return config;
});

// Device ID Singleton to prevent race conditions on startup
let deviceIdPromise = null;
const DEVICE_ID_KEY = "anonymousDeviceId";

export async function getDeviceId() {
  if (deviceIdPromise) {
    return deviceIdPromise;
  }

  deviceIdPromise = (async () => {
    try {
      let id = await AsyncStorage.getItem(DEVICE_ID_KEY);
      if (!id) {
        id = generateUUID();
        await AsyncStorage.setItem(DEVICE_ID_KEY, String(id));
      }
      return id;
    } catch (e) {
      console.error("[api] Error retrieving device ID:", e);
      return null;
    }
  })();

  return deviceIdPromise;
}


let isRefreshing = false;
let refreshPromise = null;

async function refreshAccessToken() {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const res = await api.post("/auth/refresh", { refreshToken });
  const { token: newAccessToken, refreshToken: newRefreshToken, user } =
    res.data || {};

  if (!newAccessToken || !newRefreshToken) {
    throw new Error("Refresh response missing tokens");
  }

  await setAuthToken(newAccessToken);
  await setRefreshToken(newRefreshToken);

  return { newAccessToken, newRefreshToken, user };
}

async function ensureRefreshed() {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = refreshAccessToken()
    .catch(async (e) => {
      // Refresh failed: clear local session so user is forced to login.
      await clearSession();
      throw e;
    })
    .finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });

  return refreshPromise;
}

// Endpoints that are accessible without mandatory authentication
// (optionalAuth or fully public). These document the no-login app's
// public surface; the response interceptor no longer suppresses refresh
// based on this list. Instead it checks whether a refresh token exists
// before attempting refresh, which transparently handles auth-protected
// endpoints such as /dashboard/stats and /draft-library/saved (POST/DELETE)
// while keeping genuinely anonymous users unaffected.
const PUBLIC_ENDPOINTS = [
  "/judge-directory",
  "/district-court-judges",
  "/police-stations",
  "/delhi-district-courts",
  "/bare-acts",
  "/supreme-court",
  "/tribunals",
  "/dashboard",
  "/knowledge-hub",
  "/draft-library",
  "/revenue-court",
  "/tax-corporate",
  "/criminal-law-acts",
  "/misc-forms",
  "/ai",  // AI chat endpoints are publicly accessible (Floating AI agent)
  "/court-holidays",
  "/daily-cause-list",
  "/legal-news",
  "/cases",
];

// Automatic token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    const status = error?.response?.status;

    // If we cannot retry, just reject.
    if (!originalRequest || status !== 401) {
      return Promise.reject(error);
    }

    // Prevent infinite loops.
    if (originalRequest.__isRetryRequest) {
      return Promise.reject(error);
    }

    // Do not refresh if the failed request itself was auth endpoints.
    const url = originalRequest?.url || "";
    if (
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/logout") ||
      url.includes("/auth/logout-all") ||
      url.includes("/auth/me")
    ) {
      return Promise.reject(error);
    }

    // Only attempt refresh when a refresh token exists.
    // Anonymous users (no refresh token) get a normal controlled failure here
    // instead of an impossible refresh attempt.
    if (!(await getRefreshToken())) {
      return Promise.reject(error);
    }

    try {
      originalRequest.__isRetryRequest = true;
      const { newAccessToken } = await ensureRefreshed();
      // Update header and retry.
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api.request(originalRequest);
    } catch (refreshErr) {
      return Promise.reject(refreshErr);
    }
  },
);

export { api };
export default api;

export async function login({ email, password }) {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
}

export async function register(payload) {
  try {
    const res = await api.post("/auth/register", payload);
    return res.data;
  } catch (error) {
    console.log("[api] register error:", {
      message: error?.message,
      // Axios error cases
      hasResponse: !!error?.response,
      status: error?.response?.status,
      data: error?.response?.data,
      hasRequest: !!error?.request,
    });
    throw error;
  }
}

export async function getStates() {
  const res = await api.get("/states");
  return res.data;
}

export async function searchLawyers({
  query,
  state,
  city,
  specialization,
} = {}) {
  // Backend supports: state, city, specialization (no "query" field in lawyers route)
  // Keep "query" for backward compatibility.
  const params = {
    ...(state ? { state } : {}),
    ...(city ? { city } : {}),
    ...(specialization ? { specialization } : {}),
    ...(query ? { specialization: query } : {}),
  };

  const res = await api.get("/lawyers", { params });
  return res.data;
}

// Helpers for auth screens to persist returned tokens
export async function persistTokens({ token, refreshToken }) {
  if (token) await setAuthToken(token);
  if (refreshToken) await setRefreshToken(refreshToken);
}

export async function isAuthenticated() {
  const token = await getAuthToken();
  return !!token;
}

export async function logout() {
  // Best-effort: call backend to revoke current session, then clear local tokens.
  try {
    const refreshToken = await getRefreshToken();
    if (refreshToken) {
      await api.post("/auth/logout", { refreshToken });
    }
  } catch (e) {
    // ignore network/server errors; proceed to clear local state
  } finally {
    await clearSession();
  }
}

export async function logoutAll() {
  try {
    const refreshToken = await getRefreshToken();
    if (refreshToken) {
      await api.post("/auth/logout-all", { refreshToken });
    }
  } catch (e) {
    // ignore network/server errors; proceed to clear local state
  } finally {
    await clearSession();
  }
}

/**
 * Normalizes Axios/network errors into human-friendly messages across status codes.
 * Ensures that 400, 401, 403, 404, 409, 429, 500, network loss, and timeouts
 * have consistent, clear user-facing feedback without crashing or showing raw stack traces.
 */
export function normalizeApiError(error) {
  if (!error) return "An unexpected error occurred.";
  if (typeof error === "string") return error;

  if (error.response) {
    const { status, data } = error.response;
    const msg = data?.message || data?.error;
    if (msg && typeof msg === "string") return msg;

    switch (status) {
      case 400:
        return "Invalid request. Please verify the provided details.";
      case 401:
        return "Session expired or authentication required. Please sign in.";
      case 403:
        return "You do not have permission to perform this action.";
      case 404:
        return "The requested record was not found.";
      case 409:
        return "A conflict occurred (record already exists).";
      case 429:
        return "Too many requests. Please wait a moment and try again.";
      case 500:
      case 502:
      case 503:
      case 504:
        return "Service temporarily unavailable. Please try again shortly.";
      default:
        return `Server returned error (${status}). Please try again.`;
    }
  }

  if (error.code === "ECONNABORTED" || (error.message && error.message.includes("timeout"))) {
    return "Request timed out. Please check your network connection and retry.";
  }

  if (error.message === "Network Error" || !error.response) {
    return "Unable to connect to the server. Please check your internet connection.";
  }

  return error.message || "An unexpected error occurred.";
}

