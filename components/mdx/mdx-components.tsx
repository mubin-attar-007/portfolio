import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Callout } from "@/components/ui/callout";
import { PullQuote } from "@/components/ui/pull-quote";
import { CodeBlock } from "@/components/ui/code-block";
import { Figure } from "@/components/ui/figure";
import { DecisionLog } from "@/components/mdx/decision-log";
import { FailureLog } from "@/components/mdx/failure-log";

/**
 * MDX component map — plain markdown elements styled to the design system
 * (Prose), plus the custom evidence blocks available inside content. Headings
 * get slugged ids for anchoring. Server-safe (no client hooks).
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
function toText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(toText).join("");
  if (node && typeof node === "object" && "props" in node) {
    return toText((node as { props: { children?: ReactNode } }).props.children);
  }
  return "";
}

function H2({ children, ...props }: ComponentPropsWithoutRef<"h2">) {
  return (
    <h2 id={slugify(toText(children))} className="mt-12 scroll-mt-24 text-2xl text-ink" {...props}>
      {children}
    </h2>
  );
}
function H3({ children, ...props }: ComponentPropsWithoutRef<"h3">) {
  return (
    <h3 id={slugify(toText(children))} className="mt-8 scroll-mt-24 text-xl text-ink" {...props}>
      {children}
    </h3>
  );
}

export const mdxComponents = {
  h2: H2,
  h3: H3,
  p: (p: ComponentPropsWithoutRef<"p">) => <p className="mt-4 leading-[1.75] text-ink-secondary" {...p} />,
  ul: (p: ComponentPropsWithoutRef<"ul">) => <ul className="mt-4 list-disc space-y-2 pl-5 marker:text-ink-tertiary" {...p} />,
  ol: (p: ComponentPropsWithoutRef<"ol">) => <ol className="mt-4 list-decimal space-y-2 pl-5 marker:text-ink-tertiary" {...p} />,
  li: (p: ComponentPropsWithoutRef<"li">) => <li className="pl-1 leading-[1.7] text-ink-secondary" {...p} />,
  a: ({ href = "", ...p }: ComponentPropsWithoutRef<"a">) => (
    <a
      href={href}
      className="text-ink underline decoration-border-strong underline-offset-2 hover:decoration-accent"
      {...(/^https?:\/\//.test(href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...p}
    />
  ),
  strong: (p: ComponentPropsWithoutRef<"strong">) => <strong className="font-medium text-ink" {...p} />,
  em: (p: ComponentPropsWithoutRef<"em">) => <em {...p} />,
  hr: () => <hr className="my-10 border-border" />,
  blockquote: (p: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote className="my-6 border-l-[length:var(--stripe-width)] border-border-strong pl-5 text-ink-secondary italic" {...p} />
  ),
  code: (p: ComponentPropsWithoutRef<"code">) => (
    <code className="rounded-[var(--radius-sm)] bg-bg-subtle px-1.5 py-0.5 font-mono text-[0.85em] text-ink" {...p} />
  ),
  // custom blocks usable directly in MDX
  Callout,
  PullQuote,
  CodeBlock,
  Figure,
  DecisionLog,
  FailureLog,
};
