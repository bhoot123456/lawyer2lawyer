import api, { getAuthToken, normalizeApiError } from "@/services/api";

// Case APIs (JWT protected) - backend mounted at /api/cases

export async function createCase(payload) {
  const res = await api.post("/cases", payload);
  return res.data;
}

export async function getCases({ query } = {}) {
  const token = await getAuthToken();
  // We no longer bail out if !token, because anonymous users can view cases.

  const params = {
    ...(query || {}),
  };

  // Small normalization for date fields that UI might provide.
  // Backend expects either YYYY-MM-DD or a date-like value for nextHearing.
  if (params.nextHearing && params.nextHearing instanceof Date) {
    params.nextHearing = params.nextHearing.toISOString();
  }

  const res = await api.get("/cases", { params });
  return res.data;
}

export async function getCaseById(id) {
  const res = await api.get(`/cases/${id}`);
  return res.data?.case ?? res.data;
}

export async function updateCase(id, payload) {
  const res = await api.put(`/cases/${id}`, payload);
  return res.data;
}

/**
 * Permanently delete a case via DELETE /api/cases/:id (the shared axios
 * instance attaches JWT + X-Device-Id headers automatically).
 *
 * On failure it throws an Error annotated with:
 *   - `status`: HTTP status when the server responded (403 / 404 / 5xx …),
 *     or 0 for transport-level failures (offline / timeout / no response).
 *   - `message`: a specific, user-facing message for the failure mode — the
 *     UI can never render a raw stack trace or axios internals.
 *
 * Callers should special-case `err.status === 404` (already deleted on
 * another device/session) and remove the case locally with a soft notice.
 */
export async function deleteCase(id) {
  try {
    const res = await api.delete(`/cases/${id}`);
    return res.data;
  } catch (e) {
    throw classifyDeleteError(e);
  }
}

function classifyDeleteError(e) {
  const status = e?.response?.status;

  if (status === 403) {
    return deleteError(e, 403, "You don't have permission to delete this case.");
  }
  if (status === 404) {
    return deleteError(e, 404, "This case was already deleted.");
  }
  if (status && status >= 500) {
    return deleteError(e, status, "Unable to delete the case. Please try again.");
  }
  if (status) {
    // 400 / 401 / 409 / 429 etc. — reuse the shared normalizer for consistency.
    return deleteError(e, status, normalizeApiError(e));
  }

  // No HTTP response — offline, dropped connection, or client timeout.
  const timedOut =
    e?.code === "ECONNABORTED" ||
    (typeof e?.message === "string" && /timeout/i.test(e.message));
  if (timedOut) {
    return deleteError(e, 0, "Request timed out — please check your network and try again.");
  }
  return deleteError(e, 0, "Network error — please try again.");
}

function deleteError(cause, status, message) {
  const err = new Error(message);
  err.status = status;
  err.cause = cause;
  return err;
}

export async function addTimelineEntry(id, { type, description, meta } = {}) {
  const res = await api.post(`/cases/${id}/timeline`, { type, description, meta });
  return res.data;
}

export async function addNote(id, { title, description, date } = {}) {
  const payload = {
    title,
    description,
    date,
  };

  if (payload.date instanceof Date) {
    payload.date = payload.date.toISOString();
  }

  const res = await api.post(`/cases/${id}/notes`, payload);
  return res.data;
}

export async function addDocument(id, { documentName, fileUrl, category } = {}) {
  const res = await api.post(`/cases/${id}/documents`, {
    documentName,
    fileUrl,
    category,
  });
  return res.data;
}

export async function updateExpenses(
  id,
  { courtFee, stamp, printing, travel, miscellaneous } = {},
) {
  const res = await api.put(`/cases/${id}/expenses`, {
    courtFee,
    stamp,
    printing,
    travel,
    miscellaneous,
  });
  return res.data;
}

