/**
 * /writing, /notes and article-page copy (spec/prototype/writing.html). Words
 * only: the posts themselves come from content/writing and content/notes, and
 * nothing here states a fact about my work.
 */

/** The three kinds of post, in the order the filter offers them. */
export const POST_KINDS = ["essay", "guide", "note"] as const;
export type PostKind = (typeof POST_KINDS)[number];

/** The `?type=` value the index reads, or "all". */
export type PostFilter = PostKind | "all";

export const writingPage = {
  meta: {
    title: "Writing",
    description:
      "Essays, guides and notes on shipping AI safely: retrieval, evaluation, agents and the infrastructure behind my projects.",
  },
  notesMeta: {
    title: "Notes",
    description:
      "A running notebook: short, single-decision notes on retrieval, evaluation, agents and infrastructure.",
  },
  kicker: "Writing",
  title: "Essays, guides and notes",
  lede:
    "Essays and implementation guides on shipping AI safely, plus a running notebook on retrieval, evaluation, agents and the infrastructure behind my projects.",
  rss: { label: "Subscribe to RSS", href: "/rss.xml" },
  filter: {
    label: "Filter by type",
    options: { all: "All writing", essay: "Essays", guide: "Guides", note: "Notes" } satisfies Record<
      PostFilter,
      string
    >,
    /** The live-region sentence after a filter changes. */
    status: (count: number, filter: PostFilter) =>
      `Showing ${count} ${count === 1 ? "post" : "posts"}${
        filter === "all" ? "" : ` · ${writingPage.filter.options[filter]}`
      }`,
  },
  featuredLabel: "Featured",
  listLabel: "All writing",
  readMore: "Read more",
  /** Singular labels for a post's category pill and list row. */
  kind: { essay: "Essay", guide: "Guide", note: "Note" } satisfies Record<PostKind, string>,
  coverBrand: "Mubin Attar",
} as const;

export const articlePage = {
  back: { writing: "Back to writing", notes: "Back to notes" },
  updated: "Updated",
  jumpTo: "Jump to",
  askTitle: "Ask AI about this",
  askAssistant: "Ask this site's assistant",
  /** The question the site's assistant receives. */
  askQuestion: (title: string) => `Explain the key decisions and trade-offs in "${title}".`,
  /** The prompt the external assistants receive, with the article's absolute URL. */
  externalPrompt: (url: string) => `Read ${url} and explain its key decisions and trade-offs.`,
  external: [
    { name: "ChatGPT", href: (q: string) => `https://chatgpt.com/?q=${q}` },
    { name: "Claude", href: (q: string) => `https://claude.ai/new?q=${q}` },
    { name: "Perplexity", href: (q: string) => `https://www.perplexity.ai/search?q=${q}` },
  ],
  openIn: (name: string) => `Open in ${name}`,
  share: { label: "Share this post", copy: "Copy link", copied: "Link copied" },
  related: "Related project",
  cta: {
    title: "Building something like this?",
    body: "I take on Forward Deployed Engineer and Applied AI Engineer roles, and freelance projects.",
    label: "Get in touch",
    href: "/contact",
  },
} as const;
