/** Curated teaching examples of the documented policy, not an executable validator. */
export type BoundaryCase = {
  id: string;
  label: string;
  sql: string;
  context: string;
  checks: readonly { label: string; state: "pass" | "fail" | "unknown"; result: string }[];
  outcome: "eligible" | "refused";
  title: string;
  explanation: string;
};

export const boundaryCases: readonly BoundaryCase[] = [
  {
    id: "read", label: "Read query",
    sql: "SELECT created_at, amount\nFROM orders\nORDER BY created_at DESC\nLIMIT 10;",
    context: "orders is present in the enrolled schema.",
    checks: [
      { label: "Single statement", state: "pass", result: "Pass" },
      { label: "Read-only statement", state: "pass", result: "Pass" },
      { label: "Enrolled schema", state: "pass", result: "Matched" },
    ],
    outcome: "eligible", title: "Eligible for read-only execution",
    explanation: "This example satisfies the illustrated checks. Database permissions, a timeout, and a row cap remain separate execution controls.",
  },
  {
    id: "write", label: "Hidden write",
    sql: "SELECT *\nINTO orders_copy\nFROM orders;",
    context: "SELECT INTO creates a table in PostgreSQL.",
    checks: [
      { label: "Single statement", state: "pass", result: "Pass" },
      { label: "Read-only statement", state: "fail", result: "Write detected" },
      { label: "Enrolled schema", state: "unknown", result: "Not reached" },
    ],
    outcome: "refused", title: "Refused before execution",
    explanation: "Starting with SELECT is not enough. The validator explicitly rejects SELECT INTO because it writes a new table.",
  },
  {
    id: "schema", label: "No schema",
    sql: "SELECT created_at, amount\nFROM orders\nORDER BY created_at DESC\nLIMIT 10;",
    context: "The database’s enrolled schema index is missing.",
    checks: [
      { label: "Single statement", state: "pass", result: "Pass" },
      { label: "Read-only statement", state: "pass", result: "Pass" },
      { label: "Enrolled schema", state: "fail", result: "Unavailable" },
    ],
    outcome: "refused", title: "Refused before execution",
    explanation: "The SQL is unchanged, but the schema cannot be verified. With a database specified, the validator fails closed instead of guessing.",
  },
] as const;
