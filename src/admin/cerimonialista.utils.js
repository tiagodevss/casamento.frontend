export function groupPendingHumanThreads(messages) {
  const byPhone = new Map();

  for (const message of messages ?? []) {
    if (!message?.needsHuman || message.resolvedAt || !message.phone) continue;
    const current = byPhone.get(message.phone) ?? [];
    current.push(message);
    byPhone.set(message.phone, current);
  }

  return [...byPhone.entries()]
    .map(([phone, threadMessages]) => {
      const ordered = [...threadMessages].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
      const newest = ordered[ordered.length - 1];
      return {
        ...newest,
        phone,
        messageCount: ordered.length,
        messages: ordered,
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function isFutureSchedule(value, now = Date.now()) {
  if (!value) return false;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) && timestamp > now;
}

export function isExpiryAfterSchedule(expiresAt, scheduledAt, now = Date.now()) {
  if (!expiresAt) return false;
  const expiry = new Date(expiresAt).getTime();
  if (!Number.isFinite(expiry) || expiry <= now) return false;
  if (!scheduledAt) return true;
  const scheduled = new Date(scheduledAt).getTime();
  return Number.isFinite(scheduled) && expiry > scheduled;
}
