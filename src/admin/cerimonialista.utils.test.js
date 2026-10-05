import test from "node:test";
import assert from "node:assert/strict";

import { groupPendingHumanThreads, isFutureSchedule } from "./cerimonialista.utils.js";

test("groups pending human messages by phone and keeps the newest message", () => {
  const threads = groupPendingHumanThreads([
    { id: "new", phone: "5519", needsHuman: true, resolvedAt: null, createdAt: "2026-10-05T12:00:00Z", body: "nova" },
    { id: "old", phone: "5519", needsHuman: true, resolvedAt: null, createdAt: "2026-10-05T11:00:00Z", body: "antiga" },
    { id: "done", phone: "5521", needsHuman: true, resolvedAt: "2026-10-05T10:00:00Z", createdAt: "2026-10-05T09:00:00Z" },
  ]);

  assert.equal(threads.length, 1);
  assert.equal(threads[0].id, "new");
  assert.equal(threads[0].messageCount, 2);
});

test("accepts only future schedules", () => {
  const now = new Date("2026-10-05T12:00:00Z").getTime();
  assert.equal(isFutureSchedule("2026-10-05T12:01:00Z", now), true);
  assert.equal(isFutureSchedule("2026-10-05T11:59:00Z", now), false);
  assert.equal(isFutureSchedule("invalid", now), false);
});
