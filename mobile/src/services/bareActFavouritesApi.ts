import { api, getAuthToken } from "@/services/api";
import {
  getBareActFavoriteIds,
  addBareActFavourite as addLocalBareActFavourite,
  removeBareActFavourite as removeLocalBareActFavourite,
} from "@/utils/actsStorage";

export type BareActFavouriteListResponse = {
  success?: boolean;
  data?: { bareActIds?: string[] };
  bareActIds?: string[];
};

/**
 * Fetches Bare Act favourites.
 * - Anonymous users: resolves from AsyncStorage via actsStorage (no backend call, no 401).
 * - Authenticated users: GET /bare-acts/favourites (behavior unchanged).
 */
export async function getBareActFavourites(): Promise<BareActFavouriteListResponse> {
  const token = await getAuthToken();

  if (!token) {
    const local = await getBareActFavoriteIds();
    const ids = Array.from(local);
    return { success: true, data: { bareActIds: ids }, bareActIds: ids };
  }

  const res = await api.get("/bare-acts/favourites");
  return res.data;
}

/**
 * Adds a Bare Act to favourites.
 * - Anonymous users: adds the id locally via actsStorage (no backend POST, no 401).
 * - Authenticated users: POST /bare-acts/favourites/:id (behavior unchanged).
 */
export async function addBareActFavourite(id: string): Promise<any> {
  const token = await getAuthToken();

  if (!token) {
    await addLocalBareActFavourite(String(id));
    return {
      success: true,
      data: { bareActId: String(id) },
      bareActId: String(id),
    };
  }

  const res = await api.post(`/bare-acts/favourites/${id}`);
  return res.data;
}

/**
 * Removes a Bare Act from favourites.
 * - Anonymous users: removes the id locally via actsStorage (no backend DELETE, no 401).
 * - Authenticated users: DELETE /bare-acts/favourites/:id (behavior unchanged).
 */
export async function removeBareActFavourite(id: string): Promise<any> {
  const token = await getAuthToken();

  if (!token) {
    await removeLocalBareActFavourite(String(id));
    return {
      success: true,
      data: { deleted: true },
      deleted: true,
    };
  }

  const res = await api.delete(`/bare-acts/favourites/${id}`);
  return res.data;
}
