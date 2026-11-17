/**
 * pdf-info — the two facts the résumé printer and its test need from a PDF
 * that Chromium printed: how many pages it has, and its document information
 * (Title, Author, Subject, Keywords). Chromium writes the Title from <title>
 * and nothing else, so `build-resume-pdf.mts` sets the rest with
 * `writePdfInfo`, and `test/resume-pdf.test.mts` reads them back with
 * `readPdfInfo`.
 *
 * Scope: what Chromium's PDF backend (Skia) writes — page and Info
 * dictionaries as plain objects, and one classic cross-reference table. A file
 * outside that shape throws instead of being written back damaged.
 */

/** The document information the résumé sets. */
export type PdfInfo = {
  title: string;
  author: string;
  subject: string;
  keywords: string;
};

/** Bytes as a string of the same length: one char per byte, so indices are byte offsets. */
const asText = (pdf: Uint8Array): string => Buffer.from(pdf).toString("latin1");

/** The number of page objects. Zero means the file is not in the shape this module reads. */
export function pdfPageCount(pdf: Uint8Array): number {
  return asText(pdf).match(/\/Type\s*\/Page(?![A-Za-z])/g)?.length ?? 0;
}

/** A PDF text string in UTF-16BE with a byte-order mark, written as hex, so any character survives. */
function textString(value: string): string {
  let hex = "FEFF";
  for (let i = 0; i < value.length; i += 1) {
    hex += value.charCodeAt(i).toString(16).toUpperCase().padStart(4, "0");
  }
  return `<${hex}>`;
}

/** A hex or literal PDF string, decoded (UTF-16BE with a BOM, else single bytes). */
function decodeString(token: string): string {
  if (token.startsWith("<")) {
    const hex = token.slice(1, -1).replace(/\s+/g, "");
    const bytes = Buffer.from(hex, "hex");
    if (bytes[0] === 0xfe && bytes[1] === 0xff) return bytes.subarray(2).swap16().toString("utf16le");
    return bytes.toString("latin1");
  }
  return token.slice(1, -1).replace(/\\([()\\])/g, "$1");
}

/** A dictionary's string entries: `/Key <hex>` or `/Key (literal without nested parentheses)`. */
const STRING_ENTRY = /\/([A-Za-z]+)\s*(<[0-9A-Fa-f\s]*>|\((?:\\.|[^\\()])*\))/g;

/** Where the cross-reference table, the trailer and the Info object sit. */
function locate(text: string) {
  const startxref = text.lastIndexOf("startxref");
  const xrefAt = Number(/startxref\s+(\d+)/.exec(text.slice(startxref))?.[1] ?? Number.NaN);
  if (startxref === -1 || !text.startsWith("xref", xrefAt)) {
    throw new Error("pdf-info: expected one classic cross-reference table (Chromium's output).");
  }
  const trailerAt = text.indexOf("trailer", xrefAt);
  const infoNumber = Number(/\/Info\s+(\d+)\s+0\s+R/.exec(text.slice(trailerAt, startxref))?.[1] ?? Number.NaN);
  if (trailerAt === -1 || !Number.isInteger(infoNumber)) throw new Error("pdf-info: the trailer names no Info dictionary.");

  // Each subsection is a "first count" line followed by `count` entries:
  // "oooooooooo ggggg n" for an object in use, "… f" for a free one.
  const table = text.slice(xrefAt + "xref".length, trailerAt).split(/\r\n|\r|\n/).map((line) => line.trim()).filter(Boolean);
  const offsets = new Map<number, number>();
  for (let i = 0; i < table.length; ) {
    const [first, count] = table[i]!.split(/\s+/).map(Number) as [number, number];
    for (let k = 0; k < count; k += 1) {
      const [offset, , kind] = table[i + 1 + k]!.split(/\s+/);
      if (kind === "n") offsets.set(first + k, Number(offset));
    }
    i += 1 + count;
  }

  const infoAt = offsets.get(infoNumber) ?? -1;
  if (!text.startsWith(`${infoNumber} 0 obj`, infoAt)) throw new Error("pdf-info: the Info object is not where the table says.");
  const infoEnd = text.indexOf("endobj", infoAt) + "endobj".length;
  return { startxref, xrefAt, trailerAt, infoNumber, infoAt, infoEnd };
}

/** The Info dictionary's string entries, decoded: { Title, Author, Subject, Keywords, Creator, … }. */
export function readPdfInfo(pdf: Uint8Array): Record<string, string> {
  const text = asText(pdf);
  const { infoAt, infoEnd } = locate(text);
  const entries: Record<string, string> = {};
  for (const [, key, token] of text.slice(infoAt, infoEnd).matchAll(STRING_ENTRY)) entries[key!] = decodeString(token!);
  return entries;
}

/**
 * The same PDF with its Info dictionary rewritten: Title, Author, Subject and
 * Keywords set, every other entry (Creator, Producer, dates) kept as it was.
 * The objects after the dictionary move by the change in its length, so every
 * cross-reference offset past it, and `startxref`, move with them.
 */
export function writePdfInfo(pdf: Uint8Array, info: PdfInfo): Buffer {
  const text = asText(pdf);
  const { startxref, xrefAt, trailerAt, infoNumber, infoAt, infoEnd } = locate(text);

  const replaced = new Set(["Title", "Author", "Subject", "Keywords"]);
  const kept = [...text.slice(infoAt, infoEnd).matchAll(STRING_ENTRY)]
    .filter(([, key]) => !replaced.has(key!))
    .map(([entry]) => entry);
  const entries = [
    `/Title ${textString(info.title)}`,
    `/Author ${textString(info.author)}`,
    `/Subject ${textString(info.subject)}`,
    `/Keywords ${textString(info.keywords)}`,
    ...kept,
  ];
  const object = `${infoNumber} 0 obj\n<<${entries.join("\n")}>>\nendobj`;
  const shift = object.length - (infoEnd - infoAt);

  const table = text
    .slice(xrefAt, trailerAt)
    .replace(/(\d{10}) (\d{5}) n/g, (entry, offset: string, generation: string) =>
      Number(offset) > infoAt ? `${String(Number(offset) + shift).padStart(10, "0")} ${generation} n` : entry,
    );

  const out =
    text.slice(0, infoAt) +
    object +
    text.slice(infoEnd, xrefAt) +
    table +
    text.slice(trailerAt, startxref) +
    `startxref\n${xrefAt + shift}\n%%EOF\n`;
  return Buffer.from(out, "latin1");
}
