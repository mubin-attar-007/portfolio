// Unit tests for lib/ai/answer-format.ts — the markdown subset assistant answers
// are rendered with. The parser returns plain data the panel maps to React
// elements, so these tests pin both the formatting and the safety contract:
// nothing in model text can become markup or a link.

import test from "node:test";
import assert from "node:assert/strict";

import { parseAnswer, parseInline, type Block } from "../lib/ai/answer-format.ts";

const text = (value: string) => ({ kind: "text", text: value }) as const;

test("blank lines separate paragraphs; single line breaks stay inside one", () => {
  assert.deepEqual(parseAnswer("First line\nsecond line\n\nNext paragraph"), [
    { kind: "paragraph", inlines: [text("First line\nsecond line")] },
    { kind: "paragraph", inlines: [text("Next paragraph")] },
  ] satisfies Block[]);
});

test("bullets and numbers become lists", () => {
  assert.deepEqual(parseAnswer("Intro:\n- one\n* two\n\n1. first\n2) second"), [
    { kind: "paragraph", inlines: [text("Intro:")] },
    { kind: "list", ordered: false, items: [[text("one")], [text("two")]] },
    { kind: "list", ordered: true, items: [[text("first")], [text("second")]] },
  ] satisfies Block[]);
});

test("bold, italic and inline code render as their own runs", () => {
  assert.deepEqual(parseInline("A **fail-closed** `validator` is *the* gate"), [
    text("A "),
    { kind: "strong", children: [text("fail-closed")] },
    text(" "),
    { kind: "code", text: "validator" },
    text(" is "),
    { kind: "em", children: [text("the")] },
    text(" gate"),
  ]);
});

test("unclosed markers stay literal, so a half-streamed answer reads cleanly", () => {
  assert.deepEqual(parseInline("**what he's shipped"), [text("**what he's shipped")]);
  assert.deepEqual(parseInline("run `DROP TAB"), [text("run `DROP TAB")]);
  assert.deepEqual(parseInline("2*3*4 = 24"), [text("2*3*4 = 24")]);
  // An open fence is shown as code until it closes.
  assert.deepEqual(parseAnswer("```sql\nSELECT 1"), [{ kind: "code", text: "SELECT 1" }]);
});

test("a markdown link becomes its text and address, never a link", () => {
  const blocks = parseAnswer("See [the case study](https://evil.example/phish) for more.");
  assert.deepEqual(blocks, [
    { kind: "paragraph", inlines: [text("See the case study (https://evil.example/phish) for more.")] },
  ] satisfies Block[]);
});

test("HTML in model text is data, not markup", () => {
  const blocks = parseAnswer('<img src=x onerror="alert(1)"> <script>alert(1)</script>');
  assert.deepEqual(blocks, [
    { kind: "paragraph", inlines: [text('<img src=x onerror="alert(1)"> <script>alert(1)</script>')] },
  ] satisfies Block[]);
});

test("headings, rules and fenced code are recognized", () => {
  assert.deepEqual(parseAnswer("## Summary\n---\n```\nconst x = 1;\n```"), [
    { kind: "heading", inlines: [text("Summary")] },
    { kind: "code", text: "const x = 1;" },
  ] satisfies Block[]);
});

test("an indented line continues the list item above it", () => {
  assert.deepEqual(parseAnswer("- first item\n  continues here\n- second"), [
    { kind: "list", ordered: false, items: [[text("first item continues here")], [text("second")]] },
  ] satisfies Block[]);
});

test("the injection refusal's bold renders as bold", () => {
  const [block] = parseAnswer("Try **the DBWhisper architecture**.");
  assert.equal(block?.kind, "paragraph");
  assert.deepEqual(block?.kind === "paragraph" ? block.inlines[1] : null, {
    kind: "strong",
    children: [text("the DBWhisper architecture")],
  });
});
