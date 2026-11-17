// Renders the site's raster icons from its one drawn mark, app/icon.svg:
//
//   app/favicon.ico    16, 32 and 48px — for every client that asks for
//                      /favicon.ico directly: bookmarks, feed readers, link
//                      previews, and the icon services behind search results
//   app/apple-icon.png 180px, opaque — the iOS home-screen icon (iOS rounds
//                      the corners itself, so the ground runs to the edge)
//
// Next.js serves both through its file conventions and writes their <link>
// tags. Run it after changing app/icon.svg or the palette it is drawn in:
//
//   npm run build:icons
//
// It records the hashes of the source and of each output in
// scripts/icons.lock.json; test/icons.test.mts fails until a changed icon.svg
// is rendered again. sharp is Next.js's own image dependency, not a new one.

import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";

const ROOT = resolve(import.meta.dirname, "..");
const SOURCE = "app/icon.svg";
const FAVICON = "app/favicon.ico";
const APPLE_ICON = "app/apple-icon.png";
const LOCK = resolve(ROOT, "scripts", "icons.lock.json");
const FAVICON_SIZES = [16, 32, 48];
const APPLE_SIZE = 180;
/** The density at which an SVG's own width renders at its pixel size. */
const BASE_DENSITY = 72;

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
/**
 * The source's hash over LF line endings: git checks text out as CRLF on
 * Windows and LF in CI, and the lock must agree on both (test/icons.test.mts
 * hashes it the same way). The outputs are binary and never converted.
 */
const textSha256 = (text) => sha256(text.replace(/\r\n?/g, "\n"));

const svg = await readFile(resolve(ROOT, SOURCE));
const markup = svg.toString("utf8");
const width = Number(/<svg\b[^>]*\bwidth="(\d+(?:\.\d+)?)"/.exec(markup)?.[1]);
const ground = /<rect\b[^>]*\bfill="(#[0-9a-f]{6})"/i.exec(markup)?.[1];
if (!width || !ground) {
  throw new Error(`${SOURCE} needs a numeric width and a <rect fill="#rrggbb"> ground`);
}

/** The mark drawn at `size` pixels — rasterised at that size, never scaled down. */
function render(size) {
  return sharp(svg, { density: (BASE_DENSITY * size) / width }).resize(size, size);
}

/** An .ico container holding one PNG per size (supported by every current browser). */
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);
  let offset = header.length + 16 * images.length;
  const entries = images.map(({ size, data }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size, 0); // width (sizes here are all below 256)
    entry.writeUInt8(size, 1); // height
    entry.writeUInt8(0, 2); // palette size: none
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // colour planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    return entry;
  });
  return Buffer.concat([header, ...entries, ...images.map(({ data }) => data)]);
}

const favicon = ico(
  await Promise.all(
    FAVICON_SIZES.map(async (size) => ({ size, data: await render(size).png().toBuffer() })),
  ),
);
// Flattened onto the ground colour: no alpha, so the rounded corners of the
// drawn square fill in and the icon is a full-bleed square.
const appleIcon = await render(APPLE_SIZE).flatten({ background: ground }).png().toBuffer();

await writeFile(resolve(ROOT, FAVICON), favicon);
await writeFile(resolve(ROOT, APPLE_ICON), appleIcon);
await writeFile(
  LOCK,
  `${JSON.stringify(
    {
      source: SOURCE,
      sourceSha256: textSha256(markup),
      outputs: { [FAVICON]: sha256(favicon), [APPLE_ICON]: sha256(appleIcon) },
    },
    null,
    2,
  )}\n`,
);

console.log(
  `Rendered ${FAVICON} (${FAVICON_SIZES.join(", ")}px, ${favicon.length} B) and ${APPLE_ICON} (${APPLE_SIZE}px, ${appleIcon.length} B) from ${SOURCE}.`,
);
