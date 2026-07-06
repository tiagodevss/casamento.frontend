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

  listAdminGifts: () => request("/admin/gifts"),
  createGift: (payload) => request("/admin/gifts", { method: "POST", body: JSON.stringify(payload) }),
  updateGift: (id, payload) =>
    request(`/admin/gifts/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  setGiftActive: (id, active) =>
    request(`/admin/gifts/${id}/active`, { method: "PATCH", body: JSON.stringify({ active }) }),
  uploadGiftImage: (id, file) => {
    const form = new FormData();
    form.append("file", file);
    return request(`/admin/gifts/${id}/image`, { method: "POST", body: form });
  },
  deleteGiftImage: (id) => request(`/admin/gifts/${id}/image`, { method: "DELETE" }),
};
