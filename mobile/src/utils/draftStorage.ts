import AsyncStorage from "@react-native-async-storage/async-storage";

export type SavedDraft = {
  _id: string;
  templateId: string;
  sectionKey: string;
  title: string;
  filledFields: { key: string; value: any }[];
  customBody: string;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = "lawyer2lawyer:draftLibrary:savedDrafts:v1";
const DRAFTS_LIMIT = 100;

function nowISO(): string {
  return new Date().toISOString();
}

function safeParse(raw: unknown): SavedDraft[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (d): d is SavedDraft =>
      typeof d === "object" &&
      d !== null &&
      typeof d._id === "string" &&
      typeof d.templateId === "string",
  );
}

export async function getSavedDraftsLocal(): Promise<SavedDraft[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return safeParse(JSON.parse(raw));
  } catch {
    return [];
  }
}

export async function saveDraftLocal(payload: {
  templateId: string;
  sectionKey: string;
  title?: string;
  filledFields: { key: string; value: any }[];
  customBody?: string;
}): Promise<SavedDraft> {
  const list = await getSavedDraftsLocal();

  const existingIndex = list.findIndex(
    (d) => d.templateId === payload.templateId,
  );

  const ts = nowISO();

  let draft: SavedDraft;

  if (existingIndex >= 0) {
    draft = {
      ...list[existingIndex],
      title: payload.title ?? list[existingIndex].title,
      filledFields: payload.filledFields,
      customBody: payload.customBody ?? list[existingIndex].customBody,
      updatedAt: ts,
    };
    list[existingIndex] = draft;
  } else {
    draft = {
      _id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      templateId: payload.templateId,
      sectionKey: payload.sectionKey,
      title: payload.title || payload.templateId,
      filledFields: payload.filledFields,
      customBody: payload.customBody || "",
      createdAt: ts,
      updatedAt: ts,
    };
    list.unshift(draft);
  }

  // Keep most-recent-first, enforce limit
  const trimmed = list.slice(0, DRAFTS_LIMIT);

  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Storage failure is non-fatal for anonymous convenience data
  }

  return draft;
}

export async function deleteDraftLocal(id: string): Promise<boolean> {
  const list = await getSavedDraftsLocal();
  const next = list.filter((d) => d._id !== id);
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage failure is non-fatal
  }
  return list.length !== next.length;
}
