// The site's icons are its own mark in its current palette — never the
// create-next-app defaults — and the raster icons are the ones rendered from
// app/icon.svg by `npm run build:icons`. Run via `npm test`.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import manifest from "../app/manifest.ts";
import { BROWSER_CHROME } from "../constants/theme.ts";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const read = (path: string): Buffer => readFileSync(join(ROOT, path));
const digest = (algorithm: string, bytes: Buffer | string): string =>
  createHash(algorithm).update(bytes).digest("hex");
const REGENERATE = "run `npm run build:icons` and commit the icons with scripts/icons.lock.json";

/** create-next-app's favicon.ico (Vercel's triangle), as the repository's first commit shipped it. */
const CREATE_NEXT_APP_FAVICON_MD5 = "c30c7d42707a47a3f4591831641e50dc";

/** A light-theme token's hex value: its first definition in styles/tokens.css, on :root. */
function token(name: string): string {
  const css = read("styles/tokens.css").toString("utf8");
  const match = new RegExp(`${name}:\\s*(#[0-9a-f]{6})\\b`, "i").exec(css);
  assert.ok(match, `styles/tokens.css defines ${name} as a hex colour`);
  return match[1]!.toLowerCase();
}

/** Width, height and colour type, from a PNG's IHDR chunk. */
function pngHeader(png: Buffer): { width: number; height: number; colourType: number } {
  assert.equal(png.subarray(1, 4).toString("latin1"), "PNG", "a PNG signature");
  return { width: png.readUInt32BE(16), height: png.readUInt32BE(20), colourType: png.readUInt8(25) };
}

test("favicon.ico is the site's mark at 16, 32 and 48px, not the create-next-app default", () => {
  const ico = read("app/favicon.ico");
  assert.notEqual(digest("md5", ico), CREATE_NEXT_APP_FAVICON_MD5, "app/favicon.ico is still create-next-app's icon");
  assert.equal(ico.readUInt16LE(2), 1, "an icon (type 1) container");
  const sizes = Array.from({ length: ico.readUInt16LE(4) }, (_, i) => {
    const entry = 6 + 16 * i;
    const offset = ico.readUInt32LE(entry + 12);
    const { width, height } = pngHeader(ico.subarray(offset, offset + ico.readUInt32LE(entry + 8)));
    assert.equal(width, ico.readUInt8(entry), "each frame matches its directory entry");
    assert.equal(height, width, "each frame is square");
    return width;
  });
  assert.deepEqual(sizes, [16, 32, 48]);
});

test("the drawn mark uses the current palette", () => {
  const svg = read("app/icon.svg").toString("utf8").toLowerCase();
  assert.ok(svg.includes(`fill="${token("--color-bg")}"`), "app/icon.svg's ground is --color-bg");
  assert.ok(svg.includes(`stroke="${token("--color-accent")}"`), "app/icon.svg's mark is --color-accent");
});

test("the apple touch icon is an opaque 180px square", () => {
  const { width, height, colourType } = pngHeader(read("app/apple-icon.png"));
  assert.deepEqual({ width, height }, { width: 180, height: 180 });
  assert.equal(colourType, 2, "RGB without alpha: iOS shows transparency as black");
});

test("the raster icons were rendered from the current icon.svg", () => {
  const lock = JSON.parse(read("scripts/icons.lock.json").toString("utf8")) as {
    source: string;
    sourceSha256: string;
    outputs: Record<string, string>;
  };
  // Over LF line endings, as the script hashes it: git checks text out as CRLF
  // on Windows and LF in CI.
  const source = read(lock.source).toString("utf8").replace(/\r\n?/g, "\n");
  assert.equal(digest("sha256", source), lock.sourceSha256, `${lock.source} changed since the icons were rendered: ${REGENERATE}`);
  assert.deepEqual(Object.keys(lock.outputs).sort(), ["app/apple-icon.png", "app/favicon.ico"]);
  for (const [path, sha] of Object.entries(lock.outputs)) {
    assert.equal(digest("sha256", read(path)), sha, `${path} is not the file the last render wrote: ${REGENERATE}`);
  }
});

test("browser chrome and the manifest use each theme's ground", () => {
  assert.equal(BROWSER_CHROME.light, token("--color-bg"));
  assert.equal(BROWSER_CHROME.dark, token("--dark-bg"));
  const m = manifest();
  assert.equal(m.theme_color, BROWSER_CHROME.light);
  assert.equal(m.background_color, BROWSER_CHROME.light);
  assert.deepEqual(m.icons?.map((icon) => icon.src), ["/icon.svg", "/apple-icon.png"]);
});
