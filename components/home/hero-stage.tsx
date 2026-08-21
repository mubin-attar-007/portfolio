import { Check, CircleCheck, ShieldCheck, Lock, Gauge } from "lucide-react";
import { flagshipHome } from "@/content/home-visual";
import styles from "./hero-stage.module.css";

/**
 * HeroProductStage — DBWhisper, rendered as the product.
 *
 * This replaces the generic hero terminal. The difference that matters is not
 * fidelity, it is *specificity*: every string here is real DBWhisper vocabulary
 * — the agent's actual tool names (`search_tables`, `validate_sql`), the real
 * dialect, the real guarantee — so the surface reads as a screenshot of
 * something that exists rather than as a UI kit filled with placeholder text.
 *
 * The one thing that is NOT real is the four result rows, which come from a demo
 * database. That is why the result panel carries a "sample data" chip inside the
 * frame: a number a visitor could mistake for a customer figure has to say what
 * it is at the point of display, not in a footnote.
 *
 * Server component — the whole stage is static markup and ships zero JavaScript.
 * A tabbed or animated version was considered and rejected: the run has already
 * completed, and replaying it on a loop would be an attention device rather than
 * information. The reader can take it in at their own pace.
 *
 * Responsive: below `lg` the context rail is dropped and the question moves
 * above the run, so the mobile composition is ask → run → query → result. This
 * is a different layout, not the desktop one scaled until the 12px type is
 * unreadable.
 *
 * A11y: the result is a real `<table>` with `<th scope="col">`; step states pair
 * a check glyph with the word in its detail line, so nothing is carried by
 * colour alone; the decorative window dots are `aria-hidden`.
 */
const EVIDENCE_ICON = { gate: ShieldCheck, readonly: Lock, measured: Gauge } as const;

export function HeroProductStage() {
  const s = flagshipHome.stage;

  return (
    <div className={styles.wrap}>
      <div className={styles.stage}>
        <div className={styles.titlebar}>
          <span className={styles.dots} aria-hidden>
            <span />
            <span />
            <span />
          </span>
          <span className={styles.appName}>
            {s.app} — {s.connection}
          </span>
          <span className={styles.badge}>
            <Lock size={10} strokeWidth={2.25} aria-hidden />
            {s.badge}
          </span>
        </div>

        <div className={styles.body}>
          {/* Context rail — what the user brought to the question. */}
          <div className={styles.rail}>
            <div className={styles.railBlock}>
              <p className={styles.railLabel}>{s.askLabel}</p>
              <div className={styles.ask}>
                <p className={styles.askText}>{s.question}</p>
                <span className={styles.caret} aria-hidden />
              </div>
            </div>

            <div className={styles.railBlock}>
              <p className={styles.railLabel}>{s.recentLabel}</p>
              <ul className={styles.recentList}>
                {s.recent.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>

            <div className={styles.railBlock}>
              <p className={styles.railLabel}>{s.schemaLabel}</p>
              <ul className={styles.schemaList}>
                {s.schema.map((t) => (
                  <li
                    key={t.name}
                    className={`${styles.schemaRow} ${t.selected ? styles.schemaRowOn : ""}`}
                  >
                    <span className={styles.schemaDot} aria-hidden />
                    {t.name}
                    <span className={styles.schemaCols}>{t.cols}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* The run. */}
          <div className={styles.main}>
            <div className={`${styles.panel} ${styles.askMobile}`}>
              <p className={styles.railLabel}>{s.askLabel}</p>
              <div className={styles.ask}>
                <p className={styles.askText}>{s.question}</p>
                <span className={styles.caret} aria-hidden />
              </div>
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHead}>
                <p className={styles.railLabel}>{s.runLabel}</p>
                <p className={styles.panelMeta}>{s.runMeta}</p>
              </div>
              <ol className={styles.steps}>
                {s.steps.map((step) => (
                  <li key={step.tool} className={styles.step}>
                    <CircleCheck className={styles.stepMark} strokeWidth={2} aria-hidden />
                    <span className={styles.stepTool}>{step.tool}</span>
                    <span className={styles.stepDetail}>{step.detail}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHead}>
                <p className={styles.railLabel}>{s.sqlLabel}</p>
              </div>
              {/* A scroll container needs a tab stop and a name, or a
                  keyboard-only reader cannot reach the end of the query
                  (WCAG 2.1.1 — axe: scrollable-region-focusable). */}
              <pre
                className={styles.sql}
                tabIndex={0}
                role="region"
                aria-label={`${s.sqlLabel}, scrollable`}
              >
                <code>
                  {s.sql.map((tok, i) =>
                    tok.t === "br" ? (
                      "\n"
                    ) : (
                      <span
                        // The token list is a fixed literal, so the index is a
                        // stable identity here — there is no reorder to survive.
                        key={i}
                        className={
                          tok.t === "kw"
                            ? styles.kw
                            : tok.t === "fn"
                              ? styles.fn
                              : tok.t === "str"
                                ? styles.str
                                : undefined
                        }
                      >
                        {tok.v}
                      </span>
                    ),
                  )}
                </code>
              </pre>
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHead}>
                <p className={styles.railLabel}>{s.resultLabel}</p>
                <span className={styles.panelMeta}>
                  <span className={styles.sample}>{s.sampleLabel}</span>
                </span>
              </div>
              <div
                className={styles.tableWrap}
                tabIndex={0}
                role="region"
                aria-label={`${s.resultLabel}, scrollable`}
              >
                <table className={styles.table}>
                  <thead>
                    <tr>
                      {s.columns.map((c) => (
                        <th key={c} scope="col">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {s.rows.map((row) => (
                      <tr key={row[0]}>
                        {row.map((cell) => (
                          <td key={cell}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                    <tr className={styles.moreRow}>
                      <td colSpan={s.columns.length}>{s.moreLabel}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className={styles.verdict}>
                <Check className={styles.verdictMark} strokeWidth={3} aria-hidden />
                {s.verdict}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Evidence cards. From `xl` these float over the stage's corners; below
          that they are a plain row underneath it. */}
      <div className={styles.evidence}>
        {s.evidence.map((e, i) => {
          const Icon = EVIDENCE_ICON[e.id];
          return (
            <div key={e.id} className={`${styles.card} ${styles[`card${i}`] ?? ""}`}>
              <p className={styles.cardLabel}>
                <span className={styles.cardChip} aria-hidden>
                  <Icon className={styles.cardMark} strokeWidth={2} />
                </span>
                {e.label}
              </p>
              <p className={styles.cardBody}>{e.body}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
