const API_URL =
  import.meta.env.VITE_API_URL?.trim() ||
  (import.meta.env.PROD ? "https://api.tiagoegabriela.com.br/api" : "/api");
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

/** URL pública para imagens enviadas ao servidor (imagePath = gifts/{id}.ext) */
export function resolveUploadUrl(imagePath) {
  if (!imagePath) return null;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath;

  const customBase = import.meta.env.VITE_UPLOADS_URL?.trim();
  if (customBase) {
    return `${customBase.replace(/\/$/, "")}/${imagePath.replace(/^\//, "")}`;
  }

  const origin = API_URL.replace(/\/api\/?$/, "");
  if (origin && origin !== API_URL) {
    return `${origin}/uploads/${imagePath.replace(/^\//, "")}`;
  }

  return `/uploads/${imagePath.replace(/^\//, "")}`;
}

async function request(path, options = {}) {
  const token = getToken();
  const isFormData = options.body instanceof FormData;
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error("Sem conexão. Verifique sua internet e tente novamente.");
  }

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body?.message ?? "Algo deu errado. Tente novamente.";
    throw new Error(Array.isArray(message) ? message.join(", ") : message);
  }
  return body;
}

export const api = {
  searchGuests: (query) => request(`/rsvp/search?q=${encodeURIComponent(query)}`),
  getRsvpInvite: (guestGroupId) => request(`/rsvp/${guestGroupId}`),
  confirmRsvp: (guestGroupId, payload) =>
    request(`/rsvp/${guestGroupId}/confirm`, { method: "POST", body: JSON.stringify(payload) }),
  createPaymentOrder: (payload) =>
    request("/payments/orders", { method: "POST", body: JSON.stringify(payload) }),
  getPaymentStatus: (orderId) => request(`/payments/orders/${orderId}/status`),

  login: (email, password) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  listGuestGroups: () => request("/guests"),
  getGuestStats: () => request("/guests/stats"),
  getGuestGroup: (id) => request(`/guests/${id}`),
  createGuestGroup: (payload) => request("/guests", { method: "POST", body: JSON.stringify(payload) }),
  updateGuestGroup: (id, payload) =>
    request(`/guests/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  updateGuestRsvp: (id, payload) =>
    request(`/guests/${id}/rsvp`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteGuestGroup: (id) => request(`/guests/${id}`, { method: "DELETE" }),

  getSettings: () => request("/admin/settings"),
  updateSettings: (payload) =>
    request("/admin/settings", { method: "PATCH", body: JSON.stringify(payload) }),
};
