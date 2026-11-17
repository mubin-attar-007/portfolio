// -----------------------------------------------------------------------------
// The small markdown subset the assistant's answers are rendered with.
//
// Model text is untrusted, so it is never parsed as HTML and never reaches
// dangerouslySetInnerHTML. This module turns it into a tree of plain data —
// paragraphs, lists, code, bold, italic — and the panel maps that tree to React
// elements, which escape every string they render. Links are deliberately not
// part of the subset: a markdown link in an answer is shown as its text with the
// address beside it in plain text, so model output can never become something
// to click. The cited sources under each answer are the only links.
//
// Unclosed markers stay literal, so a half-streamed answer renders cleanly and
// settles into its final form when the closing marker arrives.
// -----------------------------------------------------------------------------

/** An inline run of answer text. */
export type Inline =
  | { kind: "text"; text: string }
  | { kind: "code"; text: string }
  | { kind: "strong" | "em"; children: Inline[] };

/** A block of answer text. Paragraph text keeps its single line breaks. */
export type Block =
  | { kind: "paragraph"; inlines: Inline[] }
  | { kind: "heading"; inlines: Inline[] }
  | { kind: "list"; ordered: boolean; items: Inline[][] }
  | { kind: "code"; text: string };

const LIST_ITEM = /^\s{0,3}(?:([-*•+])|(\d{1,3})[.)])\s+(.*)$/;
const HEADING = /^\s{0,3}#{1,6}\s+(.*?)\s*#*\s*$/;
const RULE = /^\s{0,3}(?:[-*_]\s*){3,}$/;
const FENCE = /^\s{0,3}(`{3,}|~{3,})/;
const MARKDOWN_LINK = /\[([^\]\n]+)\]\(([^)\s]+)\)/g;

/** Nesting depth for bold inside italic (or the reverse); deeper stays literal. */
const MAX_DEPTH = 2;

/** `[text](url)` → `text (url)`: the address stays readable, never clickable. */
function unlink(line: string): string {
  return line.replace(MARKDOWN_LINK, (_match, label: string, url: string) =>
    label.trim() === url ? label : `${label} (${url})`,
  );
}

/** True when the character at `i` is absent or whitespace. */
function isSpaceAt(text: string, i: number): boolean {
  const ch = text[i];
  return ch === undefined || /\s/.test(ch);
}

/** Index of the `marker` that closes an emphasis run opened before `from`, or -1. */
function closingMarker(text: string, marker: string, from: number): number {
  let at = text.indexOf(marker, from);
  while (at !== -1) {
    // A closer hugs its text, and a single `*` that is half of `**` is not one.
    const hugs = !isSpaceAt(text, at - 1) && at > from;
    const halfOfDouble = marker === "*" && (text[at + 1] === "*" || text[at - 1] === "*");
    if (hugs && !halfOfDouble) return at;
    at = text.indexOf(marker, at + marker.length);
  }
  return -1;
}

/** Parse one line or paragraph of answer text into inline runs. */
export function parseInline(text: string, depth = 0): Inline[] {
  const out: Inline[] = [];
  let buffer = "";
  const flush = () => {
    if (buffer) out.push({ kind: "text", text: buffer });
    buffer = "";
  };

  let i = 0;
  while (i < text.length) {
    const ch = text[i]!;

    if (ch === "`") {
      const end = text.indexOf("`", i + 1);
      if (end > i + 1) {
        flush();
        out.push({ kind: "code", text: text.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    } else if (depth < MAX_DEPTH && text.startsWith("**", i) && !isSpaceAt(text, i + 2)) {
      const end = closingMarker(text, "**", i + 2);
      if (end !== -1) {
        flush();
        out.push({ kind: "strong", children: parseInline(text.slice(i + 2, end), depth + 1) });
        i = end + 2;
        continue;
      }
    } else if (
      depth < MAX_DEPTH &&
      ch === "*" &&
      text[i + 1] !== "*" &&
      !isSpaceAt(text, i + 1) &&
      // `2*3*4` is arithmetic, not emphasis: an opener follows a boundary.
      (i === 0 || /[\s([{"'“‘—–-]/.test(text[i - 1]!))
    ) {
      const end = closingMarker(text, "*", i + 1);
      if (end !== -1) {
        flush();
        out.push({ kind: "em", children: parseInline(text.slice(i + 1, end), depth + 1) });
        i = end + 1;
        continue;
      }
    }

    buffer += ch;
    i++;
  }
  flush();
  return out;
}

/**
 * Parse an answer into blocks: paragraphs (split on blank lines), bulleted and
 * numbered lists, headings, and fenced code. Everything else is paragraph text.
 */
export function parseAnswer(answer: string): Block[] {
  const blocks: Block[] = [];
  const lines = answer.replace(/\r\n?/g, "\n").split("\n");

  let paragraph: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let fence: { marker: string; lines: string[] } | null = null;

  const closeParagraph = () => {
    if (paragraph.length > 0) {
      blocks.push({ kind: "paragraph", inlines: parseInline(paragraph.join("\n")) });
      paragraph = [];
    }
  };
  const closeList = () => {
    if (list) {
      blocks.push({ kind: "list", ordered: list.ordered, items: list.items.map((item) => parseInline(item)) });
      list = null;
    }
  };

  for (const raw of lines) {
    if (fence) {
      if (raw.trim().startsWith(fence.marker)) {
        blocks.push({ kind: "code", text: fence.lines.join("\n") });
        fence = null;
      } else {
        fence.lines.push(raw);
      }
      continue;
    }

    const opening = FENCE.exec(raw);
    if (opening) {
      closeParagraph();
      closeList();
      fence = { marker: opening[1]!, lines: [] };
      continue;
    }

    if (!raw.trim()) {
      closeParagraph();
      closeList();
      continue;
    }

    const line = unlink(raw);
    if (RULE.test(line)) {
      closeParagraph();
      closeList();
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      closeParagraph();
      closeList();
      blocks.push({ kind: "heading", inlines: parseInline(heading[1]!) });
      continue;
    }

    const item = LIST_ITEM.exec(line);
    if (item) {
      closeParagraph();
      const ordered = item[2] !== undefined;
      if (!list || list.ordered !== ordered) {
        closeList();
        list = { ordered, items: [] };
      }
      list.items.push(item[3]!.trim());
      continue;
    }

    if (list && /^\s+\S/.test(line)) {
      // An indented line continues the previous list item.
      const last = list.items.length - 1;
      list.items[last] = `${list.items[last]} ${line.trim()}`;
      continue;
    }

    closeList();
    paragraph.push(line.trim());
  }

  // A fence still open at the end is a half-streamed code block: show it as code.
  if (fence) blocks.push({ kind: "code", text: fence.lines.join("\n") });
  closeParagraph();
  closeList();
  return blocks;
}
