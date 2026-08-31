import { api, getAuthToken } from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type BareAct = {
  _id?: string;
  slug?: string;
  title?: string;
  actName?: string;
  shortName?: string;
  pdfUrl?: string;
  category?: string;
  year?: number | string;
  createdAt?: string;
  updatedAt?: string;
};

export type RecentlyOpenedAct = BareAct;

/**
 * Anonymous (no-login) recently-opened storage.
 *
 * The backend `/bare-acts/recent` and `/bare-acts/recent/open/:id` endpoints are
 * intentionally protected and store user-specific data (keyed by `req.user._id`).
 * Authentication/login has been removed from the app, so for anonymous users we
 * persist recently-opened act metadata in AsyncStorage instead of hitting those
 * protected endpoints (which would 401).
 *
 * This reuses the same AsyncStorage dependency already used by `@/services/api`
 * for the auth session. No fake user IDs or JWTs are created.
 */
const RECENT_STORAGE_KEY = "bareActs:recentOpened";
const RECENT_LIMIT = 20;

async function getLocalRecentlyOpened(): Promise<RecentlyOpenedAct[]> {
  try {
    const raw = await AsyncStorage.getItem(RECENT_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as RecentlyOpenedAct[]) : [];
  } catch {
    return [];
  }
}

async function setLocalRecentlyOpened(list: RecentlyOpenedAct[]): Promise<void> {
  try {
    await AsyncStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Best-effort: recent tracking is non-critical.
  }
}

function recentActId(act: RecentlyOpenedAct): string {
  return String(act._id || act.slug || "");
}

async function upsertLocalRecentlyOpened(act: RecentlyOpenedAct): Promise<RecentlyOpenedAct[]> {
  const id = recentActId(act);
  if (!id) return getLocalRecentlyOpened();

  let list = await getLocalRecentlyOpened();
  // Move to front (most-recent-first), de-duplicated by id.
  list = list.filter((a) => recentActId(a) !== id);
  list.unshift(act);
  if (list.length > RECENT_LIMIT) list = list.slice(0, RECENT_LIMIT);

  await setLocalRecentlyOpened(list);
  return list;
}

/**
 * Fetches recently-opened Bare Acts.
 * - Anonymous users: resolves from AsyncStorage (no backend call, no 401).
 * - Authenticated users: GET /bare-acts/recent (behavior unchanged).
 */
export async function getRecentlyOpenedBareActs(): Promise<any> {
  const token = await getAuthToken();

  if (!token) {
    const local = await getLocalRecentlyOpened();
    return { success: true, data: { bareActs: local }, bareActs: local };
  }

  const res = await api.get("/bare-acts/recent");
  return res.data;
}

/**
 * Tracks that a Bare Act PDF was opened.
 *
 * `act` carries the act metadata (title/pdfUrl/slug) needed so the anonymous
 * local-storage fallback can render Recently Opened entries. It is ignored for
 * authenticated users (the backend records the open keyed to the session user).
 *
 * - Anonymous users: persist to AsyncStorage only — never POST to the protected
 *   `/bare-acts/recent/open/:id` endpoint.
 * - Authenticated users: POST /bare-acts/recent/open/:id (behavior unchanged).
 */
export async function trackRecentlyOpenedBareAct(
  id: string,
  act?: BareAct,
): Promise<any> {
  const token = await getAuthToken();

  if (!token) {
    const base = (act || {}) as BareAct;
    const entry: RecentlyOpenedAct = {
      _id: base._id || id,
      slug: base.slug,
      title: base.title || base.actName || base.shortName,
      actName: base.actName,
      shortName: base.shortName,
      pdfUrl: base.pdfUrl,
      category: base.category,
      year: base.year,
      createdAt: base.createdAt,
      updatedAt: base.updatedAt,
    };

    const list = await upsertLocalRecentlyOpened(entry);
    return { success: true, data: { bareActs: list } };
  }

  const res = await api.post(`/bare-acts/recent/open/${id}`);
  return res.data;
}
