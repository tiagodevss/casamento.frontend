const API_URL = import.meta.env.VITE_API_URL ?? "/api";
const TOKEN_KEY = "admin_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body?.message ?? "Algo deu errado. Tente novamente.";
    throw new Error(Array.isArray(message) ? message.join(", ") : message);
  }
  return body;
}

export const api = {
  searchGuests: (query) => request(`/rsvp/search?q=${encodeURIComponent(query)}`),
  confirmRsvp: (guestGroupId, payload) =>
    request(`/rsvp/${guestGroupId}/confirm`, { method: "POST", body: JSON.stringify(payload) }),
  listGifts: () => request("/gifts"),
  listMessages: () => request("/messages"),
  postMessage: (payload) => request("/messages", { method: "POST", body: JSON.stringify(payload) }),
  createPaymentOrder: (payload) =>
    request("/payments/orders", { method: "POST", body: JSON.stringify(payload) }),
  getPaymentStatus: (orderId) => request(`/payments/orders/${orderId}/status`),

  login: (email, password) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  listGuestGroups: () => request("/guests"),
  getGuestGroup: (id) => request(`/guests/${id}`),
  createGuestGroup: (payload) => request("/guests", { method: "POST", body: JSON.stringify(payload) }),
  updateGuestGroup: (id, payload) =>
    request(`/guests/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteGuestGroup: (id) => request(`/guests/${id}`, { method: "DELETE" }),
};
