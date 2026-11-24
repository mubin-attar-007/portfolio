// Unit tests for lib/ai/provider-terms.ts: which visitors the Gemini tier may
// serve, and that what the site tells visitors matches the tier (ADR-022).

import test from "node:test";
import assert from "node:assert/strict";

import { ASSISTANT_COPY } from "../components/assistant/copy.ts";
import faq from "../content/faq.json" with { type: "json" };
import { countryOf, GEMINI_TIER, liveAllowed, PAID_ONLY_COUNTRIES } from "../lib/ai/provider-terms.ts";

const from = (country?: string) => new Headers(country === undefined ? {} : { "x-vercel-ip-country": country });

test("the free tier serves no visitor in the EEA, Switzerland or the UK", () => {
  for (const country of ["DE", "FR", "IE", "NL", "ES", "IT", "PL", "SE", "NO", "IS", "LI", "CH", "GB"]) {
    assert.equal(liveAllowed(from(country), "free"), false, country);
  }
  // The EEA is the 27 EU states plus Iceland, Liechtenstein and Norway; with Switzerland and the UK, 32.
  assert.equal(PAID_ONLY_COUNTRIES.size, 32);
});

test("everyone else, and a request with no reported country, may get a live answer", () => {
  for (const country of ["IN", "US", "CA", "AE", "SG", "AU", "JP"]) {
    assert.equal(liveAllowed(from(country), "free"), true, country);
  }
  assert.equal(liveAllowed(from(), "free"), true, "local development reports no country");
  assert.equal(liveAllowed(from("DE"), "paid"), true, "the paid tier has no regional rule");
});

test("the country is read only from the platform's header, in its two-letter form", () => {
  assert.equal(countryOf(from("de")), "DE");
  assert.equal(countryOf(from(" gb ")), "GB");
  assert.equal(countryOf(from("Germany")), null);
  assert.equal(countryOf(from("")), null);
  assert.equal(countryOf(from()), null);
});

test("what the site tells visitors about their question matches the tier", () => {
  const privacyAnswer = faq.faq.find((item) => item.question.startsWith("Does this assistant store my question"))?.answer ?? "";
  assert.ok(privacyAnswer, "the FAQ answers whether the assistant stores a question");
  if (GEMINI_TIER === "free") {
    assert.match(privacyAnswer, /improve its products/, "the FAQ says Google may use what is sent");
    assert.match(privacyAnswer, /European Economic Area, Switzerland and the UK/, "the FAQ says where the free tier is off");
    assert.match(ASSISTANT_COPY.privacy, /Google may use it/, "the panel's footer says Google may use it");
  } else {
    assert.doesNotMatch(privacyAnswer, /free tier/, "the FAQ still describes the free tier: update content/faq.json");
    assert.doesNotMatch(ASSISTANT_COPY.privacy, /Google may use it/);
  }
});
