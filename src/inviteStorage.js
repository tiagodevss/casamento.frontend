const INVITE_STORAGE_KEY = "wedding_invite_id";

export function getStoredInviteId() {
  try {
    return localStorage.getItem(INVITE_STORAGE_KEY)?.trim() || "";
  } catch {
    return "";
  }
}

export function setStoredInviteId(inviteId) {
  const id = inviteId?.trim();
  if (!id) return;
  try {
    localStorage.setItem(INVITE_STORAGE_KEY, id);
  } catch {
    // ignore quota / private mode failures
  }
}

export function clearStoredInviteId() {
  try {
    localStorage.removeItem(INVITE_STORAGE_KEY);
  } catch {
    // ignore
  }
}
