import assert from "node:assert/strict";
import test from "node:test";
import { securityHeaders } from "../config/security-headers.ts";

const byName = (list: { key: string; value: string }[]) => Object.fromEntries(list.map((h) => [h.key, h.value]));

test("a deploy over HTTPS gets HSTS and the insecure-request upgrade; a local server gets neither", () => {
  const deployed = byName(securityHeaders({ https: true }));
  const local = byName(securityHeaders());
  assert.match(deployed["Strict-Transport-Security"]!, /max-age=63072000/);
  assert.match(deployed["Content-Security-Policy"]!, /upgrade-insecure-requests/);
  assert.equal(local["Strict-Transport-Security"], undefined);
  assert.doesNotMatch(local["Content-Security-Policy"]!, /upgrade-insecure-requests/);
});

test("every host forbids framing and inline-object tricks", () => {
  const headers = byName(securityHeaders({ https: true }));
  assert.equal(headers["X-Frame-Options"], "DENY");
  assert.equal(headers["X-Content-Type-Options"], "nosniff");
  assert.match(headers["Content-Security-Policy"]!, /frame-ancestors 'none'/);
  assert.match(headers["Content-Security-Policy"]!, /object-src 'none'/);
});

test("eval and websocket allowances exist only in development", () => {
  assert.doesNotMatch(byName(securityHeaders())["Content-Security-Policy"]!, /unsafe-eval|ws:/);
  assert.match(byName(securityHeaders({ dev: true }))["Content-Security-Policy"]!, /'unsafe-eval'[^]*ws:/);
});
