// The flagship case studies (content/flagship): the figures are the ones the
// owner approved, word for word; nothing claims what the record cannot back;
// every capture, poster, recording and caption track the pages name exists,
// at the size the page reserves for it; and each caption track says what the
// page's scene list says, at the same times.
//
//   node --import ./test/alias-loader.mjs --test test/flagship-content.test.mts

import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { flagships } from "../content/flagship/index.ts";
import { USAGE } from "../content/flagship/shared.ts";
import { flagshipSections } from "../content/flagship/sections.ts";
import { SEO_LIMITS } from "../constants/seo.ts";
import { TITLE_SUFFIX } from "../lib/seo.ts";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const publicFile = (src: string): string => join(ROOT, "public", ...src.split("/").filter(Boolean));

/** A WebP's pixel size, read from its header (VP8, VP8L or VP8X). */
function webpSize(file: string): { width: number; height: number } {
  const b = readFileSync(file);
  assert.equal(b.toString("ascii", 0, 4), "RIFF", `${file}: a RIFF file`);
  assert.equal(b.toString("ascii", 8, 12), "WEBP", `${file}: a WebP`);
  const chunk = b.toString("ascii", 12, 16);
  if (chunk === "VP8X") return { width: b.readUIntLE(24, 3) + 1, height: b.readUIntLE(27, 3) + 1 };
  if (chunk === "VP8 ") return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
  if (chunk === "VP8L") {
    const bits = b.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  throw new Error(`${file}: unknown WebP chunk ${chunk}`);
}

/** WebVTT cues as seconds and text. */
function cues(file: string): { start: number; end: number; text: string }[] {
  const seconds = (stamp: string) => {
    const parts = stamp.split(":").map(Number);
    return parts.reduce((total, part) => total * 60 + part, 0);
  };
  return readFileSync(file, "utf8")
    .replace(/\r\n?/g, "\n")
    .split(/\n\n+/)
    .filter((block) => block.includes("-->"))
    .map((block) => {
      const [timing, ...text] = block.trim().split("\n");
      const [start, end] = timing!.split("-->").map((stamp) => seconds(stamp.trim()));
      return { start: start!, end: end!, text: text.join(" ") };
    });
}

test("a usage figure is one the owner approved, in his words", () => {
  for (const flagship of flagships) {
    const usage = flagship.figures.filter((figure) => figure.source === "approved-usage");
    assert.equal(usage.length, 1, `${flagship.slug}: one usage figure`);
    assert.deepEqual(
      { value: usage[0]!.value, label: usage[0]!.label },
      { value: USAGE[flagship.slug].figure, label: USAGE[flagship.slug].label },
      `${flagship.slug}: the approved wording`,
    );
  }
});

test("the credit is the owner's own sentence, and no one else is credited", () => {
  // The owner's words (17 Nov 2026; Bench Discovery's web platform named first at the
  // owner's request, 18 Nov 2026). Work is never attributed by git history, and no
  // colleague is named or described: not beside the credit, not on an excerpt.
  const approved: Record<string, string> = {
    "bench-discovery": "I designed, built and maintain both the web platform and the desktop app.",
    careltc: "I lead CareLTC and did the main engineering work, and I still maintain it and ship new features.",
  };
  for (const flagship of flagships) {
    assert.equal(flagship.credit.role, approved[flagship.slug], `${flagship.slug}: the approved credit, word for word`);
    assert.deepEqual(Object.keys(flagship.credit), ["role"], `${flagship.slug}: the credit holds the role only`);
    for (const excerpt of flagship.excerpts) assert.ok(!("credit" in excerpt), `${excerpt.id}: no per-excerpt credit`);
    assert.doesNotMatch(JSON.stringify(flagship), /\bcolleagues?\b|built by others|\bmine\b|my additions/i, `${flagship.slug}: no attribution`);
  }
});

test("no claim the record cannot back, and no superseded figure", () => {
  const banned = [
    /\b5 clients\b/i,
    /\b10 desktop users\b/i,
    /200\s*[–-]\s*300/,
    /\b5 admins\b/i,
    /\bdaily\b/i,
    /forward[- ]deployed|\bFDE\b/i,
    /fully offline|no network access|nothing leaves/i,
    /\bHIPAA\b|end-to-end encrypted/i,
  ];
  for (const flagship of flagships) {
    const text = JSON.stringify(flagship);
    for (const rule of banned) assert.doesNotMatch(text, rule, `${flagship.slug}: ${rule}`);
  }
});

test("every capture, poster, recording and caption track exists at the size the page reserves", () => {
  for (const flagship of flagships) {
    const shots = [flagship.hero.primary, flagship.hero.secondary, ...flagship.gallery.flatMap((tab) => tab.shots)];
    for (const shot of shots) {
      const file = publicFile(shot.src);
      assert.ok(existsSync(file), `${flagship.slug}: ${shot.src}`);
      assert.deepEqual(webpSize(file), { width: shot.width, height: shot.height }, `${shot.src}: its declared size`);
      assert.ok(shot.alt.length > 20 && shot.proves.length > 20, `${shot.src}: alt text and a caption`);
    }
    for (const recording of flagship.recordings) {
      for (const src of [recording.src, recording.poster, recording.captions]) {
        assert.ok(existsSync(publicFile(src)), `${flagship.slug}: ${src}`);
      }
      assert.deepEqual(webpSize(publicFile(recording.poster)), { width: recording.width, height: recording.height }, `${recording.poster}: the video's size`);
    }
  }
});

test("each caption track says what the scene list says, at the same times", () => {
  for (const flagship of flagships) {
    for (const recording of flagship.recordings) {
      const track = cues(publicFile(recording.captions));
      assert.equal(track.length, recording.scenes.length, `${recording.captions}: one cue per scene`);
      recording.scenes.forEach((scene, i) => {
        const cue = track[i]!;
        assert.ok(Math.abs(cue.start - scene.start) < 0.001 && Math.abs(cue.end - scene.end) < 0.001, `${recording.captions} cue ${i + 1}: ${scene.start}–${scene.end}`);
        assert.equal(cue.text, scene.text, `${recording.captions} cue ${i + 1}: its text`);
      });
      assert.ok(recording.scenes.at(-1)!.end <= recording.duration + 0.001, `${recording.id}: scenes end with the video`);
    }
  }
});

test("each case study fits a results page, and reads as plain sections", () => {
  for (const flagship of flagships) {
    const title = `${flagship.name} — case study`;
    assert.ok(`${title}${TITLE_SUFFIX}`.length <= SEO_LIMITS.titleMax, `${flagship.slug}: "${title}"`);
    assert.ok(
      flagship.summary.length >= SEO_LIMITS.descriptionMin && flagship.summary.length <= SEO_LIMITS.descriptionMax,
      `${flagship.slug}: summary is ${flagship.summary.length} characters`,
    );
    const sections = flagshipSections(flagship);
    assert.ok(sections.length > 10 && sections.every((section) => section.title && section.text.length > 40), `${flagship.slug}: sections`);
    assert.ok(sections[0]!.text.includes(USAGE[flagship.slug].sentence), `${flagship.slug}: the overview carries the usage figure`);
  }
});
