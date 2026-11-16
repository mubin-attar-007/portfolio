// Unit tests for lib/ai/rate-limit.ts: hashed client keys, the per-minute
// window, the per-client daily allowance and the instance's daily budget.
// Every limit is per server instance and best-effort (DEPLOY.md §3); these
// tests pin what one instance enforces.

import test from "node:test";
import assert from "node:assert/strict";

import {
  CLIENT_DAILY_LIVE_ANSWERS,
  GEMINI_DAILY_BUDGET,
  checkRateLimit,
  clientKeyFromHeaders,
  reserveLiveAnswer,
} from "../lib/ai/rate-limit.ts";

const DAY = 86_400_000;

test("a client key is a salted hash, never the address", () => {
  const key = clientKeyFromHeaders(new Headers({ "x-real-ip": "203.0.113.7" }));
  assert.match(key, /^[0-9a-f]{32}$/);
  assert.ok(!key.includes("203.0.113.7"));
  assert.equal(key, clientKeyFromHeaders(new Headers({ "x-real-ip": "203.0.113.7" })));
  assert.notEqual(key, clientKeyFromHeaders(new Headers({ "x-real-ip": "203.0.113.8" })));
});

test("the client-controlled leftmost x-forwarded-for entry is ignored", () => {
  const forged = clientKeyFromHeaders(new Headers({ "x-forwarded-for": "1.1.1.1, 198.51.100.2" }));
  const other = clientKeyFromHeaders(new Headers({ "x-forwarded-for": "9.9.9.9, 198.51.100.2" }));
  assert.equal(forged, other);
  // The platform's own header wins over any forwarded chain.
  assert.equal(
    clientKeyFromHeaders(new Headers({ "x-real-ip": "198.51.100.9", "x-forwarded-for": "1.1.1.1" })),
    clientKeyFromHeaders(new Headers({ "x-real-ip": "198.51.100.9" })),
  );
});

test("a client gets 15 requests a minute, then a retry time", () => {
  const key = "window-client";
  const start = 1_000_000;
  for (let i = 0; i < 15; i++) assert.ok(checkRateLimit(key, start + i).allowed, `request ${i + 1}`);
  const blocked = checkRateLimit(key, start + 20);
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retryAfterSec >= 1 && blocked.retryAfterSec <= 60);
  assert.ok(checkRateLimit(key, start + 60_001).allowed, "the window slides");
});

test("one client's daily live answers stop at its allowance; other clients are unaffected", () => {
  const day = Date.UTC(2030, 0, 1);
  for (let i = 0; i < CLIENT_DAILY_LIVE_ANSWERS; i++) assert.equal(reserveLiveAnswer("heavy", day + i), "ok");
  assert.equal(reserveLiveAnswer("heavy", day + 100), "client-allowance-reached");
  assert.equal(reserveLiveAnswer("light", day + 101), "ok");
  assert.equal(reserveLiveAnswer("heavy", day + DAY), "ok", "a new UTC day starts fresh");
});

test("the instance budget caps all clients together, and a refusal spends nothing", () => {
  const day = Date.UTC(2031, 0, 1);
  for (let i = 0; i < GEMINI_DAILY_BUDGET; i++) assert.equal(reserveLiveAnswer(`client-${i}`, day), "ok");
  assert.equal(reserveLiveAnswer("late", day), "daily-budget-reached");
  // "late" was refused without being counted, so its allowance is whole tomorrow.
  for (let i = 0; i < CLIENT_DAILY_LIVE_ANSWERS; i++) assert.equal(reserveLiveAnswer("late", day + DAY + i), "ok");
  assert.equal(reserveLiveAnswer("late", day + DAY + 99), "client-allowance-reached");
});
