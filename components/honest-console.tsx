"use client";

import { useCallback, useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

type Line = { t: string; kind: "step" | "sql" | "rule" | "ok" | "dim" };
type Scene = { cmd: string; lines: Line[] };

const SCENES: Scene[] = [
  {
    cmd: 'ask "which customers churned last month?"',
    lines: [
      { t: "▸ planning        [LangGraph]", kind: "step" },
      { t: "▸ retrieving      [pgvector · 4 tables matched]", kind: "step" },
      { t: "▸ generating SQL  ✓ read-only verified", kind: "step" },
      { t: "──────────────────────────────────────", kind: "rule" },
      { t: "SELECT c.name, c.churned_at", kind: "sql" },
      { t: "FROM   customers c", kind: "sql" },
      { t: "WHERE  c.churned_at >= date_trunc('month', now())", kind: "sql" },
      { t: "       - interval '1 month';", kind: "sql" },
      { t: "──────────────────────────────────────", kind: "rule" },
      { t: "● 128 rows · every number real", kind: "ok" },
    ],
  },
  {
    cmd: "backtest ema_cross --symbol BTC/USD",
    lines: [
      { t: "▸ event-driven replay   no look-ahead", kind: "step" },
      { t: "▸ costs applied         commission + slippage", kind: "step" },
      { t: "▸ risk gates            caps · daily-loss halt", kind: "step" },
      { t: "──────────────────────────────────────", kind: "rule" },
      { t: "return   net of fees     drawdown always shown", kind: "dim" },
      { t: "fills    next-bar open   Sharpe rf=0 (stated)", kind: "dim" },
      { t: "──────────────────────────────────────", kind: "rule" },
      { t: "● hypothetical, honestly labeled · every number real", kind: "ok" },
    ],
  },
  {
    cmd: "edge Lakers ML -110",
    lines: [
      { t: "▸ model     XGBoost · 65% CV / 3,023 games", kind: "step" },
      { t: "▸ de-vig    market implied → fair probability", kind: "step" },
      { t: "▸ edge      model − market", kind: "step" },
      { t: "──────────────────────────────────────", kind: "rule" },
      { t: "track-record: graded vs the real final score", kind: "dim" },
      { t: "──────────────────────────────────────", kind: "rule" },
      { t: "● no cherry-picking · every number real", kind: "ok" },
    ],
  },
];

const COLOR: Record<Line["kind"], string> = {
  step: "text-accent",
  sql: "text-ink",
  rule: "text-dim",
  ok: "text-accent font-semibold",
  dim: "text-muted",
};

/** One scene, mounted fresh per index (via key) so state starts clean — no reset-in-effect. */
function SceneView({ scene, reduce, onDone }: { scene: Scene; reduce: boolean; onDone: () => void }) {
  const [typed, setTyped] = useState(reduce ? scene.cmd.length : 0);
  const [shown, setShown] = useState(reduce ? scene.lines.length : 0);

  useEffect(() => {
    if (reduce) {
      const hold = setTimeout(onDone, 4000);
      return () => clearTimeout(hold);
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    let t = 0;
    const typeIv = setInterval(() => {
      t += 1;
      setTyped(t);
      if (t >= scene.cmd.length) {
        clearInterval(typeIv);
        let s = 0;
        const lineIv = setInterval(() => {
          s += 1;
          setShown(s);
          if (s >= scene.lines.length) {
            clearInterval(lineIv);
            timers.push(setTimeout(onDone, 2800));
          }
        }, 165);
        timers.push(lineIv as unknown as ReturnType<typeof setTimeout>);
      }
    }, 32);
    timers.push(typeIv as unknown as ReturnType<typeof setTimeout>);
    return () => {
      clearInterval(typeIv);
      timers.forEach((x) => {
        clearTimeout(x);
        clearInterval(x as unknown as ReturnType<typeof setInterval>);
      });
    };
  }, [scene, reduce, onDone]);

  const typingCmd = typed < scene.cmd.length;
  return (
    <div className="mono min-h-[360px] px-4 py-4 text-[12.5px] leading-6 sm:text-[13px]">
      <div className="text-ink">
        <span className="text-accent">$</span> {scene.cmd.slice(0, typed)}
        {typingCmd && <span className="caret" aria-hidden />}
      </div>
      <div className="mt-3 space-y-0.5">
        {scene.lines.slice(0, shown).map((l, i) => (
          <div key={i} className={`whitespace-pre-wrap ${COLOR[l.kind]}`}>
            {l.t}
          </div>
        ))}
        {!typingCmd && shown < scene.lines.length && <span className="caret" aria-hidden />}
      </div>
    </div>
  );
}

export function HonestConsole() {
  const reduce = useReducedMotion();
  const [si, setSi] = useState(0);
  const next = useCallback(() => setSi((v) => (v + 1) % SCENES.length), []);

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="mono ml-2 text-xs text-dim">honest-console</span>
        <span className="badge-live ml-auto flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" /> LIVE
        </span>
      </div>
      <SceneView key={si} scene={SCENES[si]} reduce={!!reduce} onDone={next} />
      <span className="sr-only">
        A demonstration terminal cycling through this engineer&apos;s work — a natural-language-to-SQL
        query, an honest backtest, and a sports-model edge calculation — each ending &quot;every
        number real.&quot;
      </span>
    </div>
  );
}
