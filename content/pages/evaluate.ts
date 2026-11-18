import { SITE } from "@/config/site";
import { AGENT_PROMPT } from "@/content/pages/home";

/**
 * /evaluate copy: how a visitor checks my work with the AI they already use.
 * Every prompt starts by pointing the AI at llms.txt, so each card works pasted
 * on its own. Claims about the site (what it stores, what the assistant does)
 * are the ones the home page and /privacy already make.
 */

/** The first sentence of every prompt on the page. */
const READ_FIRST = `Read ${SITE.url}/llms.txt and the pages it links to.`;

/** One card: what it checks, the question it asks, and the pages it should lead the AI to. */
export type EvaluatePrompt = { id: string; label: string; ask: string; pages: readonly string[] };

const PROMPTS: readonly EvaluatePrompt[] = [
  {
    id: "fit",
    label: "Role fit",
    ask: `Tell me whether ${SITE.name} fits an Applied AI Engineer role on my team, and cite the pages you used.`,
    pages: ["/llms.txt", "/hire", "/work"],
  },
  {
    id: "shipped",
    label: "Production work",
    ask: "List the products he built that are in use: who uses each, his role in it, and how it runs.",
    pages: ["/work/bench-discovery", "/work/careltc", "/work/signflow"],
  },
  {
    id: "result",
    label: "Check a result",
    ask: "Pick one result he claims, find its method, and tell me whether the method supports the claim.",
    pages: ["/evals", "/work/dbwhisper"],
  },
  {
    id: "safety",
    label: "Safe by design",
    ask: "How does he keep a model's output safe to act on? Show one concrete example from his work.",
    pages: ["/writing/trust-is-not-a-safety-model", "/work/dbwhisper"],
  },
  {
    id: "job",
    label: "Against my job description",
    ask: "Compare his work with this job description point by point, and say where the evidence is thin: [paste the description]",
    pages: ["/llms.txt", "/resume"],
  },
  {
    id: "logistics",
    label: "Hiring details",
    ask: "When could he start, where can he work, and how do I reach him?",
    pages: ["/hire", "/contact"],
  },
];

export const evaluatePage = {
  meta: {
    title: "Evaluate me with your own AI",
    description:
      "Paste one prompt into the AI you already use: it reads my llms.txt and the pages it links to, and answers from my real work with links you can check.",
  },
  hero: {
    title: "Evaluate me with your own AI",
    lead: "Paste one prompt into the AI you already use. It reads my llms.txt and the pages it links to, then answers from my real work, with links you can check.",
    prompt: AGENT_PROMPT.full,
    preview: AGENT_PROMPT.preview,
    copy: "Copy prompt",
    or: "Or point any AI at",
    llms: "/llms.txt",
    copyLink: "Copy link",
    pause: "Pause the falling lines",
    play: "Play the falling lines",
  },
  prompts: {
    title: "Ask your AI to check the work",
    lead: "Each card copies a whole prompt that starts by pointing your AI at llms.txt.",
    copy: "Copy",
    reads: "Leads to",
    items: PROMPTS.map((prompt) => ({ ...prompt, full: `${READ_FIRST} ${prompt.ask}` })),
  },
  reads: {
    title: "What your AI reads",
    lead: "Everything is a public page. Nothing needs a key or an account.",
    items: [
      { title: "llms.txt", body: "A plain summary of my work written for machines, linking every page it draws on." },
      { title: "Case studies", body: "Three products in use and four public systems: the problem, the architecture, the code and the decisions." },
      { title: "Evaluations", body: "Each result with its method, sample and date. Retired results stay listed, with the reason." },
      { title: "Résumé", body: "Roles, dates and skills, as a page and as a PDF." },
      { title: "Writing", body: "Essays and notes on validators, retrieval, evaluation and the trade-offs behind each project." },
      { title: "Hiring details", body: "The roles I'm open to, where I can work, my notice period and how to reach me." },
    ],
  },
  privacy: {
    title: "Checkable, and private by default",
    body: "Your AI answers from public pages, so you can open every page it cites and check the answer yourself.",
    steps: [
      "Your AI reads the same public pages you can. Nothing here needs a key or an account.",
      "llms.txt links every page it summarises, so an answer can cite its source and you can follow it.",
      "Ask this site's own assistant instead, and your question is used to write one answer. This site doesn't store it.",
      "The assistant never guesses at what the site doesn't publish, like a salary: it tells you to ask me directly.",
    ],
    more: { label: "How the assistant works", href: "/privacy" },
  },
  cta: {
    title: "Rather ask here?",
    body: "The assistant on this site answers from the same pages and links the page each answer used.",
    assistant: "Open the assistant",
    contact: { label: "Get in touch", href: "/contact" },
  },
} as const;
