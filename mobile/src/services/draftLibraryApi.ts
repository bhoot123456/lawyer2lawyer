import { api, getAuthToken } from "@/services/api";
import {
  getSavedDraftsLocal,
  saveDraftLocal,
  deleteDraftLocal,
} from "@/utils/draftStorage";

export async function getDraftLibraryPhase11() {
  const res = await api.get("/draft-library");
  return res?.data;
}

/**
 * Fetches saved drafts.
 * - Anonymous users: resolves from AsyncStorage (no backend call, no 401).
 * - Authenticated users: GET /draft-library/saved (behavior unchanged).
 */
export async function getSavedDrafts() {
  const token = await getAuthToken();

  if (!token) {
    const local = await getSavedDraftsLocal();
    return { success: true, drafts: local };
  }

  const res = await api.get("/draft-library/saved");
  return res?.data;
}

/**
 * Saves a draft (create or update).
 * - Anonymous users: persists to AsyncStorage only — never POSTs to the
 *   protected `/draft-library/saved` endpoint.
 * - Authenticated users: POST /draft-library/saved (behavior unchanged).
 */
export async function saveDraft(payload: {
  templateId: string;
  sectionKey: string;
  title?: string;
  filledFields: { key: string; value: any }[];
  customBody?: string;
}) {
  const token = await getAuthToken();

  if (!token) {
    const draft = await saveDraftLocal(payload);
    return { success: true, draft };
  }

  const res = await api.post("/draft-library/saved", payload);
  return res?.data;
}

/**
 * Deletes a saved draft.
 * - Anonymous users: removes from AsyncStorage only — never DELETEs via the
 *   protected `/draft-library/saved/:id` endpoint.
 * - Authenticated users: DELETE /draft-library/saved/:id (behavior unchanged).
 */
export async function deleteDraft(id: string) {
  const token = await getAuthToken();

  if (!token) {
    const deleted = await deleteDraftLocal(String(id));
    return { success: true, message: deleted ? "Draft deleted" : "Draft not found" };
  }

  const res = await api.delete(`/draft-library/saved/${id}`);
  return res?.data;
}
