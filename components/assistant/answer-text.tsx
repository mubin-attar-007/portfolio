import { Fragment, useMemo, type ReactNode } from "react";
import { parseAnswer, withoutDanglingMarkers, type Inline } from "@/lib/ai/answer-format";
import styles from "./assistant.module.css";

/** Text with its single line breaks kept. */
function withBreaks(text: string): ReactNode {
  const lines = text.split("\n");
  return lines.map((line, i) => (
    <Fragment key={i}>
      {i > 0 ? <br /> : null}
      {line}
    </Fragment>
  ));
}

function InlineText({ inlines }: { inlines: Inline[] }) {
  return inlines.map((inline, i) => {
    switch (inline.kind) {
      case "text":
        return <Fragment key={i}>{withBreaks(inline.text)}</Fragment>;
      case "code":
        return (
          <code key={i} className={styles.inlineCode}>
            {inline.text}
          </code>
        );
      case "strong":
        return (
          <strong key={i} className={styles.strong}>
            <InlineText inlines={inline.children} />
          </strong>
        );
      case "em":
        return (
          <em key={i}>
            <InlineText inlines={inline.children} />
          </em>
        );
    }
  });
}

/**
 * AnswerText — an answer, rendered from the parsed markdown subset
 * (`lib/ai/answer-format.ts`): paragraphs, headings, lists, code, bold, italic.
 *
 * Every string reaches the DOM as a React text node, so model output can never
 * become markup or a link. A heading renders as a bold paragraph: an answer
 * sits inside the dialog's outline and must not add levels to it.
 *
 * @param text The answer so far; re-parsed only when it changes.
 * @param streaming More text is coming: a bold or code opener whose closer has
 *   not arrived yet is held back rather than shown as a literal marker.
 */
export function AnswerText({ text, streaming = false }: { text: string; streaming?: boolean }) {
  const blocks = useMemo(() => parseAnswer(streaming ? withoutDanglingMarkers(text) : text), [text, streaming]);
  return blocks.map((block, i) => {
    switch (block.kind) {
      case "paragraph":
        return (
          <p key={i} className={styles.para}>
            <InlineText inlines={block.inlines} />
          </p>
        );
      case "heading":
        return (
          <p key={i} className={styles.answerHeading}>
            <InlineText inlines={block.inlines} />
          </p>
        );
      case "list": {
        const List = block.ordered ? "ol" : "ul";
        return (
          <List
            key={i}
            className={`${styles.list} ${block.ordered ? styles.numbered : styles.bulleted}`}
          >
            {block.items.map((item, j) => (
              <li key={j}>
                <InlineText inlines={item} />
              </li>
            ))}
          </List>
        );
      }
      case "code":
        return (
          <pre key={i} className={styles.codeBlock}>
            <code>{block.text}</code>
          </pre>
        );
    }
  });
}
