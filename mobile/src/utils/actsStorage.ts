import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY_FAV = "lawyer2lawyer:criminalLaws:favorites:v1";
const STORAGE_KEY_BM = "lawyer2lawyer:criminalLaws:bookmarks:v1";
// Separate key so Bare Act favourites never collide with criminal-law favourites.
const STORAGE_KEY_BARE_ACT_FAV = "lawyer2lawyer:bareActs:favorites:v1";

async function readSet(key: string): Promise<Record<string, true>> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Record<string, true>;
  } catch {
    return {};
  }
}

async function writeSet(key: string, set: Record<string, true>) {
  await AsyncStorage.setItem(key, JSON.stringify(set));
}

export async function getFavoriteActIds(): Promise<Set<string>> {
  const data = await readSet(STORAGE_KEY_FAV);
  return new Set(Object.keys(data));
}

export async function toggleFavoriteActId(actId: string): Promise<boolean> {
  const data = await readSet(STORAGE_KEY_FAV);
  const isFav = !!data[actId];
  if (isFav) delete data[actId];
  else data[actId] = true;
  await writeSet(STORAGE_KEY_FAV, data);
  return !isFav;
}

export async function isActFavorited(actId: string): Promise<boolean> {
  const data = await readSet(STORAGE_KEY_FAV);
  return !!data[actId];
}

export async function getBookmarkedActIds(): Promise<Set<string>> {
  const data = await readSet(STORAGE_KEY_BM);
  return new Set(Object.keys(data));
}

export async function toggleBookmarkedActId(actId: string): Promise<boolean> {
  const data = await readSet(STORAGE_KEY_BM);
  const isBm = !!data[actId];
  if (isBm) delete data[actId];
  else data[actId] = true;
  await writeSet(STORAGE_KEY_BM, data);
  return !isBm;
}

// --- Bare Acts favourites (anonymous/local-only, mirrors criminal-laws pattern) ---
// Keyed by a separate storage key so they never collide with criminal-law favourites.

export async function getBareActFavoriteIds(): Promise<Set<string>> {
  const data = await readSet(STORAGE_KEY_BARE_ACT_FAV);
  return new Set(Object.keys(data));
}

export async function addBareActFavourite(actId: string): Promise<void> {
  const data = await readSet(STORAGE_KEY_BARE_ACT_FAV);
  data[String(actId)] = true;
  await writeSet(STORAGE_KEY_BARE_ACT_FAV, data);
}

export async function removeBareActFavourite(actId: string): Promise<void> {
  const data = await readSet(STORAGE_KEY_BARE_ACT_FAV);
  delete data[String(actId)];
  await writeSet(STORAGE_KEY_BARE_ACT_FAV, data);
}

export async function isBareActFavorited(actId: string): Promise<boolean> {
  const data = await readSet(STORAGE_KEY_BARE_ACT_FAV);
  return !!data[String(actId)];
}

