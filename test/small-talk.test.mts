// Unit tests for lib/ai/small-talk.ts: a greeting, "how are you", thanks, a
// goodbye or "who are you" is answered as small talk; anything that asks about
// the work is searched.

import test from "node:test";
import assert from "node:assert/strict";

import { SMALL_TALK_REPLY, smallTalk, type SmallTalk } from "../lib/ai/small-talk.ts";

test("greetings, check-ins, thanks, goodbyes and questions about the assistant are small talk", () => {
  const cases: Record<SmallTalk, string[]> = {
    greeting: ["Hi", "hi!", "Hello there", "hey 👋", "Good morning", "Namaste"],
    "check-in": ["How are you?", "hi, how are you doing?", "What's up", "how's it going", "kaise ho"],
    thanks: ["Thanks", "thank you so much!", "ok", "Got it."],
    farewell: ["bye", "Goodbye!", "good night", "See you later", "thanks, bye", "ok bye", "That's all", "no thanks"],
    about: ["Who are you?", "what can you do", "Help"],
  };
  for (const [kind, texts] of Object.entries(cases)) {
    for (const text of texts) assert.equal(smallTalk(text), kind, text);
  }
});

test("a message that asks about the work is not small talk", () => {
  for (const text of [
    "Hi, what is CareLTC?",
    "hello what roles is he open to",
    "thanks, and his notice period?",
    "What is Bench Discovery?",
    "How are you handling NFC scans on iOS?",
    "bye the way, what is SignFlow?",
    "",
  ]) {
    assert.equal(smallTalk(text), null, text);
  }
});

test("each reply points back to what the assistant answers from, or to Mubin", () => {
  assert.match(SMALL_TALK_REPLY.greeting, /^Hi!/);
  assert.match(SMALL_TALK_REPLY["check-in"], /answer from the site's pages/);
  assert.match(SMALL_TALK_REPLY.about, /link the page each answer comes from/);
  assert.match(SMALL_TALK_REPLY.farewell, /email him or book a call/);
});
