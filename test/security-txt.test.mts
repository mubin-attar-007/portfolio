// /.well-known/security.txt (RFC 9116): how to report a vulnerability. The file
// must name a contact, carry its canonical address, and never be expired; this
// fails CI 30 days before the Expires date, so it is renewed rather than stale.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const TEXT = readFileSync(new URL("../public/.well-known/security.txt", import.meta.url), "utf8");
const field = (name: string) => TEXT.match(new RegExp(`^${name}: (.+)$`, "m"))?.[1]?.trim();
const DAY = 24 * 60 * 60 * 1000;

test("security.txt names a contact and its canonical address", () => {
  assert.match(field("Contact") ?? "", /^mailto:/);
  assert.equal(field("Canonical"), "https://mubin-attar.vercel.app/.well-known/security.txt");
});

test("security.txt is renewed at least 30 days before it expires, and runs at most a year", () => {
  const expires = Date.parse(field("Expires") ?? "");
  assert.ok(Number.isFinite(expires), "Expires is an ISO 8601 date");
  assert.ok(expires - Date.now() > 30 * DAY, "renew security.txt: under 30 days to its Expires date");
  assert.ok(expires - Date.now() <= 366 * DAY, "RFC 9116 recommends an Expires under a year away");
});
