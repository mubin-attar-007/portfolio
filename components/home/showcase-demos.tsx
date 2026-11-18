"use client";

import { useId, useState } from "react";
import { CheckList, Focus, Verdict, type CheckRow } from "./showcase-parts";
import styles from "./showcase.module.css";

/*
 * The illustrated showcase screens a visitor can try, as the components on
 * Clerk's home page can be clicked through: choose a case and the card answers
 * for it. Every case is fixed in advance and labelled so; nothing is sent
 * anywhere. The copy arrives as props from the server (content/pages/home.ts
 * SHOWCASE).
 */

type Choice = { id: string; label: string };

/**
 * A row of cases as native radio buttons: one is checked, the arrow keys move
 * and check (the browser's own radio group), and Tab leaves the row.
 */
function Choices({ legend, options, value, onChange }: {
  legend: string;
  options: readonly Choice[];
  value: number;
  onChange: (index: number) => void;
}) {
  const name = useId();
  return (
    <fieldset className={styles.choices}>
      <legend className="sr-only">{legend}</legend>
      {options.map((option, i) => (
        <label key={option.id} className={styles.choice}>
          <input type="radio" name={name} value={option.id} checked={i === value} onChange={() => onChange(i)} />
          <span>{option.label}</span>
        </label>
      ))}
    </fieldset>
  );
}

/**
 * The chosen case, and the sentence a screen reader hears when it changes
 * (never on load). `changed` lets the answer rise only after a choice, so the
 * card does not move twice when its screen arrives.
 */
function useCase<T extends Choice>(cases: readonly T[], announce: (chosen: T) => string) {
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState("");
  const choose = (next: number) => {
    setIndex(next);
    setStatus(announce(cases[next]!));
  };
  return { chosen: cases[index]!, index, choose, status, changed: status !== "" };
}

/** A polite status line: what the latest choice changed. */
function Status({ children }: { children: string }) {
  return (
    <p className="sr-only" role="status">
      {children}
    </p>
  );
}

type SqlCase = Choice & { sql: string };

/** DBWhisper, "Generate": pick a question and see the one read-only query it becomes, every check passed. */
export function DbWhisperGenerate({ copy, foot }: {
  copy: { title: string; hint: string; label: string; cases: readonly SqlCase[]; checks: readonly CheckRow[]; verdict: string };
  foot: string;
}) {
  const { chosen, index, choose, status, changed } = useCase(copy.cases, (c) => `${c.label}: ${copy.verdict}.`);
  return (
    <Focus title={copy.title} hint={copy.hint} foot={foot} wide>
      <Choices legend={copy.label} options={copy.cases} value={index} onChange={choose} />
      <pre key={chosen.id} className={styles.sql} data-changed={changed ? "" : undefined}>
        <code>{chosen.sql}</code>
      </pre>
      <CheckList checks={copy.checks} />
      <Verdict outcome="eligible">{copy.verdict}</Verdict>
      <Status>{status}</Status>
    </Focus>
  );
}

type BoundaryView = SqlCase & { context: string; checks: readonly CheckRow[]; outcome: "eligible" | "refused"; title: string };

/** DBWhisper, "Validate": the case study's boundary cases, each showing which check stops it before execution. */
export function DbWhisperValidate({ copy, foot }: {
  copy: { title: string; hint: string; label: string; cases: readonly BoundaryView[] };
  foot: string;
}) {
  const { chosen, index, choose, status, changed } = useCase(copy.cases, (c) => `${c.label}: ${c.title}.`);
  return (
    <Focus title={copy.title} hint={copy.hint} foot={foot} wide>
      <Choices legend={copy.label} options={copy.cases} value={index} onChange={choose} />
      <div key={chosen.id} className={styles.answer} data-changed={changed ? "" : undefined}>
        <pre className={styles.sql}>
          <code>{chosen.sql}</code>
        </pre>
        <p className={styles.context}>{chosen.context}</p>
        <CheckList checks={chosen.checks} />
        <Verdict outcome={chosen.outcome}>{chosen.title}</Verdict>
      </div>
      <Status>{status}</Status>
    </Focus>
  );
}

type Exchange = Choice & { question: string; answer: string; cites?: readonly string[] };

/**
 * The assistant: pick a question and see the shape of its answer, with the
 * pages it cites or, for a hiring term the site does not publish, its fixed
 * reply and the actions it offers.
 */
export function AssistantDemo({ copy, placeholder, foot }: {
  copy: { title: string; hint: string; label: string; questions: readonly Exchange[]; actions?: readonly string[] };
  placeholder: string;
  foot: string;
}) {
  const { chosen, index, choose, status, changed } = useCase(copy.questions, (q) => `${q.question} ${q.answer}`);
  return (
    <Focus title={copy.title} hint={copy.hint} foot={foot} wide>
      <Choices legend={copy.label} options={copy.questions} value={index} onChange={choose} />
      <div key={chosen.id} className={styles.answer} data-changed={changed ? "" : undefined}>
        <p className={styles.chatQ}>{chosen.question}</p>
        <div className={styles.chatA}>
          <p>{chosen.answer}</p>
          {chosen.cites ? (
            <div className={styles.cite}>
              {chosen.cites.map((cite) => (
                <span key={cite}>{cite}</span>
              ))}
            </div>
          ) : null}
          {copy.actions ? (
            <div className={styles.mockLinks} aria-hidden="true">
              {copy.actions.map((action) => (
                <span key={action}>{action}</span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      <p className={styles.askInput} aria-hidden="true">
        {placeholder}
      </p>
      <Status>{status}</Status>
    </Focus>
  );
}
