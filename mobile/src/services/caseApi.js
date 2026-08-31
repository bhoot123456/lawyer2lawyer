import api, { getAuthToken } from "@/services/api";

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
  return res.data;
}

export async function updateCase(id, payload) {
  const res = await api.put(`/cases/${id}`, payload);
  return res.data;
}

export async function deleteCase(id) {
  const res = await api.delete(`/cases/${id}`);
  return res.data;
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

