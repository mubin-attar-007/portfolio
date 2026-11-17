"use client";

import { useId, useMemo, useState } from "react";
import { StatusPill } from "@/components/ui/status-pill";
import { cx } from "@/components/ui/cx";
import { evalsPage } from "./copy";
import type { BoardRow, ProjectOption } from "./rows";
import styles from "./evals.module.css";

type StatusFilter = (typeof evalsPage.board.statuses)[number]["value"];
const ALL = "all";
const { board } = evalsPage;

function matchesStatus(row: BoardRow, status: StatusFilter): boolean {
  if (status === "all") return true;
  return status === "retired" ? row.retired : !row.retired;
}

/**
 * EvalsBoard — the leaderboard: a project select and a status radio group that
 * filter a real `<table>`. The filters are native controls (a `<select>`, and
 * radio inputs drawn as a segmented control), so the keyboard and screen-reader
 * behaviour is the platform's; a polite live region announces the count.
 * Without JavaScript the server render shows the "Current" rows, the default.
 */
export function EvalsBoard({ rows, projects }: { rows: BoardRow[]; projects: ProjectOption[] }) {
  const [project, setProject] = useState<string>(ALL);
  const [status, setStatus] = useState<StatusFilter>("current");
  const selectId = useId();
  const statusName = useId();
  const statusLabelId = useId();

  const shown = useMemo(
    () => rows.filter((r) => (project === ALL || r.project === project) && matchesStatus(r, status)),
    [rows, project, status],
  );

  return (
    <div>
      <div className={styles.controls}>
        <div className={styles.selectWrap}>
          <label htmlFor={selectId} className="sr-only">
            {board.project}
          </label>
          <select
            id={selectId}
            value={project}
            onChange={(e) => setProject(e.target.value)}
            className={styles.select}
          >
            <option value={ALL}>{board.allProjects}</option>
            {projects.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          <svg aria-hidden="true" viewBox="0 0 10 6" className={styles.chevron}>
            <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>

        <div role="radiogroup" aria-labelledby={statusLabelId} className={styles.segmented}>
          <span id={statusLabelId} className="sr-only">
            {board.status}
          </span>
          {board.statuses.map((s) => (
            <label key={s.value} className={styles.segment}>
              <input
                type="radio"
                name={statusName}
                value={s.value}
                checked={status === s.value}
                onChange={() => setStatus(s.value)}
                className={styles.radio}
              />
              <span>{s.label}</span>
            </label>
          ))}
        </div>

        <p aria-live="polite" className={styles.count}>
          {board.count(shown.length, rows.length)}
        </p>
      </div>

      <div className={styles.scroller}>
        <table className={styles.table}>
          <caption className="sr-only">{board.caption}</caption>
          <thead>
            <tr>
              <th scope="col" className={styles.rankCol}>
                {board.columns.rank}
              </th>
              <th scope="col">{board.columns.project}</th>
              <th scope="col">{board.columns.metric}</th>
              <th scope="col">{board.columns.result}</th>
              <th scope="col">{board.columns.scope}</th>
              <th scope="col">{board.columns.method}</th>
              <th scope="col">{board.columns.date}</th>
              <th scope="col">{board.columns.status}</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((row, i) => (
              <BoardRowView key={row.anchor} row={row} rank={i + 1} />
            ))}
          </tbody>
        </table>
        {shown.length === 0 ? <p className={styles.empty}>{board.empty}</p> : null}
      </div>
    </div>
  );
}

function BoardRowView({ row, rank }: { row: BoardRow; rank: number }) {
  return (
    <tr className={cx(row.retired && styles.retiredRow)}>
      <td className={styles.rank}>{String(rank).padStart(2, "0")}</td>
      <th scope="row" className={styles.projectCell}>
        <span className={styles.tile} aria-hidden="true">
          {row.system.charAt(0)}
        </span>
        <span className={styles.system}>{row.system}</span>
      </th>
      <td className={styles.metric}>
        {row.metric}
        {row.retiredReason ? <span className={styles.reason}>{row.retiredReason}</span> : null}
      </td>
      <td>
        <span className={cx(styles.score, styles[row.tone])}>{row.result}</span>
      </td>
      <td className={styles.scope}>{row.benchmark}</td>
      <td>
        <a
          href={`#${row.anchor}`}
          className={styles.methodLink}
          aria-label={`${board.method}: ${row.system}, ${row.benchmark}`}
        >
          {board.method}
        </a>
      </td>
      <td className={styles.date}>
        {row.date ? <time dateTime={row.date}>{row.dateLabel}</time> : "—"}
      </td>
      <td>
        {row.retired ? (
          <StatusPill status="retired" />
        ) : (
          <StatusPill status="verified">{board.measured}</StatusPill>
        )}
      </td>
    </tr>
  );
}
