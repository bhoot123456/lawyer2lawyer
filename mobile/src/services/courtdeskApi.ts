/**
 * courtdeskApi.ts — lawyer-private API client for the Phase 1 CourtDesk.
 *
 * Self-contained (does not depend on the internals of services/api.js).
 * Mirrors the existing app's auth contract:
 *   - Bearer access token + refresh token kept in AsyncStorage
 *   - 401 → one refresh attempt via /auth/refresh → retry once
 *   - Does NOT send X-Device-Id for /courtdesk surfaces (server ignores it
 *     by design; a lawyer's private list is scoped by the JWT only).
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

const API_BASE =
  (globalThis as any).process?.env?.EXPO_PUBLIC_API_URL || "http://127.0.0.1:5000/api";
const TOKEN_KEY = "authToken";
const REFRESH_KEY = "refreshToken";

const courtApi = axios.create({ baseURL: API_BASE });

async function readToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

async function readRefresh(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(REFRESH_KEY);
  } catch {
    return null;
  }
}

/**
 * Decode a JWT payload WITHOUT verifying the signature (decode-only).
 * The server is always the verifier; this exists purely so the UI can
 * route based on role before making a request.
 */
export function decodeJwtPayload(token: string | null | undefined): {
  userId?: string;
  role?: string;
  [key: string]: unknown;
} | null {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64.padEnd(Math.ceil(b64.length / 4) * 4, "=");
    const raw = (globalThis as any).atob(padded);
    const decoded = decodeURIComponent(
      raw
        .split("")
        .map((ch: string) => "%" + ch.charCodeAt(0).toString(16).padStart(2, "0"))
        .join(""),
    );
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

let refreshInFlight: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    const refreshToken = await readRefresh();
    if (!refreshToken) return false;
    try {
      const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
      if (!data?.token) return false;
      await AsyncStorage.setItem(TOKEN_KEY, data.token);
      if (data.refreshToken) await AsyncStorage.setItem(REFRESH_KEY, data.refreshToken);
      return true;
    } catch {
      return false;
    }
  })();
  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}

courtApi.interceptors.request.use(
  async (config) => {
    const token = await readToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (err) => Promise.reject(err),
);

courtApi.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error?.config as AxiosRequestConfig & { _retried?: boolean };
    if (error?.response?.status === 401 && original && !original._retried) {
      original._retried = true;
      const ok = await tryRefresh();
      if (ok) {
        const token = await readToken();
        if (original.headers) original.headers.Authorization = `Bearer ${token}`;
        return courtApi(original);
      }
      // Refresh failed/rejected — caller screens redirect to login.
    }
    return Promise.reject(error);
  },
);

// ── Phase 1 surfaces ──────────────────────────────────────────────────────
export async function getLawyerProfile(): Promise<any> {
  const res: AxiosResponse = await courtApi.get("/courtdesk/profile");
  return res.data;
}

export async function getLawyerCases(params?: Record<string, unknown>): Promise<any> {
  const res: AxiosResponse = await courtApi.get("/courtdesk/cases", { params });
  return res.data;
}

export async function getLawyerCase(id: string): Promise<any> {
  const res: AxiosResponse = await courtApi.get(`/courtdesk/cases/${id}`);
  return res.data;
}