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

  getWhatsAppStatus: () => request("/admin/whatsapp/status"),
  connectWhatsApp: () => request("/admin/whatsapp/connect", { method: "POST" }),
  getWhatsAppQrCode: () => request("/admin/whatsapp/qrcode"),
  disconnectWhatsApp: () => request("/admin/whatsapp/disconnect", { method: "POST" }),
  sendWhatsAppTest: (payload) =>
    request("/admin/whatsapp/test", { method: "POST", body: JSON.stringify(payload) }),

  getCommunicationStats: () => request("/admin/communications/stats"),
  listCommunicationTemplates: () => request("/admin/communications/templates"),
  updateCommunicationTemplate: (id, payload) =>
    request(`/admin/communications/templates/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  listCommunicationCampaigns: () => request("/admin/communications/campaigns"),
  createCommunicationCampaign: (payload) =>
    request("/admin/communications/campaigns", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateCommunicationCampaign: (id, payload) =>
    request(`/admin/communications/campaigns/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  previewCommunicationCampaign: (id) =>
    request(`/admin/communications/campaigns/${id}/preview`, { method: "POST" }),
  scheduleCommunicationCampaign: (id, scheduledAt) =>
    request(`/admin/communications/campaigns/${id}/schedule`, {
      method: "POST",
      body: JSON.stringify({ scheduledAt }),
    }),
  sendCommunicationCampaignNow: (id) =>
    request(`/admin/communications/campaigns/${id}/send-now`, { method: "POST" }),
  cancelCommunicationCampaign: (id) =>
    request(`/admin/communications/campaigns/${id}/cancel`, { method: "POST" }),
  listCommunicationDeliveries: (id) =>
    request(`/admin/communications/campaigns/${id}/deliveries`),
  sendGuestCommunication: (id, message) =>
    request(`/admin/communications/guests/${id}/send`, {
      method: "POST",
      body: JSON.stringify({ message }),
    }),
  listWhatsAppConversations: (needsHuman = false) =>
    request(`/admin/communications/conversations?needsHuman=${needsHuman ? "true" : "false"}`),
  replyWhatsAppConversation: (id, message) =>
    request(`/admin/communications/conversations/${id}/reply`, {
      method: "POST",
      body: JSON.stringify({ message }),
    }),
  resolveWhatsAppConversation: (id) =>
    request(`/admin/communications/conversations/${id}/resolve`, { method: "POST" }),
};
