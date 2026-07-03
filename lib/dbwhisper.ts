// Thin client + shared types for the live dbwhisper NL->SQL backend, plus the
// canned samples used as the honest fallback when the live call can't run.
//
// The hero always shows something real OR clearly labels demo data — it never
// fabricates a live number.

export const DBWHISPER_URL = "https://heisenbergblue-dbwhisper.hf.space";

export type Receipt = { key: string; value: string; ok?: boolean };

export type PipeResult = {
  sql: string;
  columns: string[];
  rows: string[][];
  receipts: Receipt[];
  /** true when the numbers came from a live backend call */
  live: boolean;
  /** shown on the honest chip when we fell back */
  note?: string;
};

/** Sample NL queries offered as chips (and used for the canned fallback). */
export const SAMPLES: { q: string; fallback: Omit<PipeResult, "live"> }[] = [
  {
    q: "top 5 products by revenue",
    fallback: {
      sql: "SELECT p.name, SUM(oi.qty * oi.unit_price) AS revenue\nFROM order_items oi\nJOIN products p ON p.id = oi.product_id\nGROUP BY p.name ORDER BY revenue DESC LIMIT 5;",
      columns: ["product", "revenue"],
      rows: [
        ["Atlas Pro", "$48,210"],
        ["Nimbus", "$39,880"],
        ["Beacon", "$31,540"],
        ["Vertex", "$27,120"],
        ["Cobalt", "$22,905"],
      ],
      receipts: [
        { key: "guardrail", value: "read-only ✓", ok: true },
        { key: "rows", value: "5" },
        { key: "p95", value: "910ms" },
        { key: "cost", value: "$0.0024" },
      ],
    },
  },
  {
    q: "which city has the most customers",
    fallback: {
      sql: "SELECT city, count(*) AS customers\nFROM customers\nGROUP BY city ORDER BY customers DESC LIMIT 5;",
      columns: ["city", "customers"],
      rows: [
        ["Mumbai", "1,842"],
        ["Bengaluru", "1,517"],
        ["Delhi", "1,388"],
        ["Pune", "906"],
        ["Hyderabad", "841"],
      ],
      receipts: [
        { key: "guardrail", value: "read-only ✓", ok: true },
        { key: "rows", value: "5" },
        { key: "p95", value: "770ms" },
        { key: "cost", value: "$0.0019" },
      ],
    },
  },
  {
    q: "signups in the last 30 days",
    fallback: {
      sql: "SELECT date_trunc('day', created_at) AS day,\n       count(*) AS signups\nFROM users\nWHERE created_at >= now() - interval '30 days'\nGROUP BY 1 ORDER BY 1 DESC;",
      columns: ["day", "signups"],
      rows: [
        ["2026-07-02", "218"],
        ["2026-07-01", "195"],
        ["2026-06-30", "203"],
        ["2026-06-29", "187"],
      ],
      receipts: [
        { key: "guardrail", value: "read-only ✓", ok: true },
        { key: "rows", value: "1,204" },
        { key: "p95", value: "840ms" },
        { key: "cost", value: "$0.0021" },
      ],
    },
  },
];

// ---- live backend response shape (subset of QueryResponse) ----
type QueryResultData = {
  results?: Array<Record<string, unknown>>;
  sql?: string;
  row_count?: number;
  execution_time_ms?: number | null;
};
type QueryResponse = {
  status?: string;
  sql?: string | null;
  validation_passed?: boolean | null;
  data?: QueryResultData | null;
  error?: string | null;
  metadata?: { execution_time_ms?: number | null; total_rows?: number | null } | null;
};

function fmtCell(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "number") return String(v);
  return String(v);
}

/**
 * POST an NL query to the live dbwhisper backend and normalise the response
 * into a PipeResult. Rejects (so the caller falls back) on any network error,
 * timeout, CORS block, non-200, or error status. Never throws synchronously.
 */
export async function runLiveQuery(query: string, signal?: AbortSignal): Promise<PipeResult> {
  const res = await fetch(`${DBWHISPER_URL}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, db_flag: "demo", output_format: "json" }),
    signal,
  });

  if (!res.ok) throw new Error(`backend ${res.status}`);
  const body = (await res.json()) as QueryResponse;

  if (body.status !== "success" || !body.sql) {
    throw new Error(body.error || "backend returned no SQL");
  }

  const data = body.data ?? {};
  const resultRows = Array.isArray(data.results) ? data.results : [];
  const columns = resultRows.length ? Object.keys(resultRows[0]) : [];
  const rows = resultRows.slice(0, 6).map((r) => columns.map((c) => fmtCell(r[c])));

  const rowCount = data.row_count ?? resultRows.length;
  const ms = data.execution_time_ms ?? body.metadata?.execution_time_ms ?? null;

  const receipts: Receipt[] = [
    {
      key: "guardrail",
      value: body.validation_passed ? "read-only ✓" : "read-only",
      ok: !!body.validation_passed,
    },
    { key: "rows", value: rowCount.toLocaleString() },
  ];
  if (ms != null) receipts.push({ key: "time", value: `${Math.round(ms)}ms` });

  return {
    sql: body.sql,
    columns,
    rows,
    receipts,
    live: true,
  };
}
