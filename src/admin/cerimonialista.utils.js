export function groupPendingHumanThreads(messages) {
  const byPhone = new Map();

  for (const message of messages ?? []) {
    if (!message?.needsHuman || message.resolvedAt || !message.phone) continue;
    const current = byPhone.get(message.phone);
    if (!current) {
      byPhone.set(message.phone, { ...message, messageCount: 1 });
      continue;
    }
    current.messageCount += 1;
    if (new Date(message.createdAt).getTime() > new Date(current.createdAt).getTime()) {
      byPhone.set(message.phone, { ...message, messageCount: current.messageCount });
    }
  }

  return [...byPhone.values()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function isFutureSchedule(value, now = Date.now()) {
  if (!value) return false;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) && timestamp > now;
}
