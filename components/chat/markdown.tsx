"use client";

// Minimal, dependency-free markdown renderer for streamed assistant text.
//
// We deliberately DON'T pull in react-markdown: the site runs under a strict
// CSP and the "no deps if easy" rule applies. The assistant's output is a small,
// known subset — paragraphs, bullet/numbered lists, bold, italic, inline code,
// links, headings. We parse only that subset and render React elements (never
// dangerouslySetInnerHTML), so there is no HTML-injection surface at all.

import { Fragment, type ReactNode } from "react";

/** Inline formatting: **bold**, *italic*, `code`, [text](url). Safe by construction. */
function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  // Order matters: code first (so * inside code isn't parsed), then links, bold, italic.
  const pattern =
    /(`[^`]+`)|(\[[^\]]+\]\((?:https?:\/\/|\/|mailto:)[^)\s]+\))|(\*\*[^*]+\*\*)|(\*[^*]+\*)/g;

  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = pattern.exec(text)) !== null) {
    if (m.index > last) nodes.push(<Fragment key={`${keyPrefix}-t${i}`}>{text.slice(last, m.index)}</Fragment>);
    const token = m[0];
    const key = `${keyPrefix}-m${i}`;
    if (token.startsWith("`")) {
      nodes.push(<code key={key} className="chat-code">{token.slice(1, -1)}</code>);
    } else if (token.startsWith("[")) {
      const lm = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      if (lm) {
        const href = lm[2];
        const external = /^https?:\/\//.test(href);
        nodes.push(
          <a
            key={key}
            href={href}
            className="chat-link"
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {lm[1]}
          </a>,
        );
      } else {
        nodes.push(<Fragment key={key}>{token}</Fragment>);
      }
    } else if (token.startsWith("**")) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("*")) {
      nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
    }
    last = m.index + token.length;
    i++;
  }
  if (last < text.length) nodes.push(<Fragment key={`${keyPrefix}-tend`}>{text.slice(last)}</Fragment>);
  return nodes;
}

type Block =
  | { type: "p"; text: string }
  | { type: "h"; level: 2 | 3; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] };

/** Group lines into paragraph / heading / list blocks. */
function parseBlocks(src: string): Block[] {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let para: string[] = [];

  const flushPara = () => {
    if (para.length) {
      blocks.push({ type: "p", text: para.join(" ") });
      para = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      flushPara();
      continue;
    }
    // heading
    const h = /^(#{2,3})\s+(.*)$/.exec(trimmed);
    if (h) {
      flushPara();
      blocks.push({ type: "h", level: h[1].length === 2 ? 2 : 3, text: h[2] });
      continue;
    }
    // unordered list — collect consecutive items
    if (/^[-*]\s+/.test(trimmed)) {
      flushPara();
      const items: string[] = [];
      let j = i;
      while (j < lines.length && /^\s*[-*]\s+/.test(lines[j])) {
        items.push(lines[j].replace(/^\s*[-*]\s+/, "").trim());
        j++;
      }
      blocks.push({ type: "ul", items });
      i = j - 1;
      continue;
    }
    // ordered list
    if (/^\d+\.\s+/.test(trimmed)) {
      flushPara();
      const items: string[] = [];
      let j = i;
      while (j < lines.length && /^\s*\d+\.\s+/.test(lines[j])) {
        items.push(lines[j].replace(/^\s*\d+\.\s+/, "").trim());
        j++;
      }
      blocks.push({ type: "ol", items });
      i = j - 1;
      continue;
    }
    para.push(trimmed);
  }
  flushPara();
  return blocks;
}

export function Markdown({ text }: { text: string }) {
  const blocks = parseBlocks(text);
  return (
    <div className="chat-md">
      {blocks.map((b, bi) => {
        const key = `b${bi}`;
        switch (b.type) {
          case "h":
            return b.level === 2 ? (
              <h4 key={key} className="chat-md-h">{renderInline(b.text, key)}</h4>
            ) : (
              <h5 key={key} className="chat-md-h">{renderInline(b.text, key)}</h5>
            );
          case "ul":
            return (
              <ul key={key} className="chat-md-ul">
                {b.items.map((it, ii) => (
                  <li key={`${key}-${ii}`}>{renderInline(it, `${key}-${ii}`)}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={key} className="chat-md-ol">
                {b.items.map((it, ii) => (
                  <li key={`${key}-${ii}`}>{renderInline(it, `${key}-${ii}`)}</li>
                ))}
              </ol>
            );
          default:
            return (
              <p key={key} className="chat-md-p">
                {renderInline(b.text, key)}
              </p>
            );
        }
      })}
    </div>
  );
}
