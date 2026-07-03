"use client";

import { Loader2, Play, RotateCcw } from "lucide-react";
import { useRef, useState } from "react";

type Pyodide = {
  runPythonAsync: (code: string) => Promise<unknown>;
  setStdout: (opts: { batched: (s: string) => void }) => void;
  setStderr: (opts: { batched: (s: string) => void }) => void;
};

declare global {
  interface Window {
    loadPyodide?: (opts: { indexURL: string }) => Promise<Pyodide>;
  }
}

const PYODIDE_BASE = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";

let pyodidePromise: Promise<Pyodide> | null = null;
/** Lazy-load the Pyodide runtime from CDN, once, on first Run. */
function getPyodide(): Promise<Pyodide> {
  if (pyodidePromise) return pyodidePromise;
  pyodidePromise = new Promise<Pyodide>((resolve, reject) => {
    if (window.loadPyodide) {
      window.loadPyodide({ indexURL: PYODIDE_BASE }).then(resolve, reject);
      return;
    }
    const s = document.createElement("script");
    s.src = `${PYODIDE_BASE}pyodide.js`;
    s.onload = () => window.loadPyodide?.({ indexURL: PYODIDE_BASE }).then(resolve, reject);
    s.onerror = () => reject(new Error("Could not load the Python runtime."));
    document.head.appendChild(s);
  });
  return pyodidePromise;
}

const DEFAULT_CODE = `# This runs live in your browser — Python compiled to WebAssembly (Pyodide).
# Not a gif, not a mock. Real Python, executed right here. Edit me and hit Run.

import statistics as st

# a strategy's daily returns
returns = [0.012, -0.004, 0.008, 0.015, -0.006, 0.02, -0.01, 0.009]
sharpe = st.mean(returns) / st.pstdev(returns) * (252 ** 0.5)

print(f"annualized Sharpe: {sharpe:.2f}")
print("every number above was computed just now — in your browser.")
`;

export function PyPlayground() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "running">("idle");
  const pyRef = useRef<Pyodide | null>(null);

  async function run() {
    setOutput("");
    try {
      if (!pyRef.current) {
        setStatus("loading");
        pyRef.current = await getPyodide();
      }
      setStatus("running");
      let buf = "";
      const write = (s: string) => {
        buf += `${s}\n`;
        setOutput(buf);
      };
      pyRef.current.setStdout({ batched: write });
      pyRef.current.setStderr({ batched: write });
      await pyRef.current.runPythonAsync(code);
      if (!buf) setOutput("(no output — add a print statement)");
    } catch (e) {
      setOutput(e instanceof Error ? e.message : String(e));
    } finally {
      setStatus("idle");
    }
  }

  const busy = status !== "idle";
  const label = status === "loading" ? "Loading Python…" : status === "running" ? "Running…" : "Run";

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="mono ml-2 text-xs text-dim">playground.py</span>
        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setCode(DEFAULT_CODE);
              setOutput("");
            }}
            className="mono text-dim transition hover:text-ink"
            aria-label="Reset code"
          >
            <RotateCcw size={14} />
          </button>
          <button
            type="button"
            onClick={run}
            disabled={busy}
            className="btn btn-accent !px-3 !py-1.5 !text-[13px] disabled:opacity-70"
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
            {label}
          </button>
        </div>
      </div>
      <div className="grid md:grid-cols-2">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          aria-label="Python code editor"
          className="mono min-h-[280px] resize-none bg-transparent p-4 text-[12.5px] leading-6 text-ink outline-none"
        />
        <div className="mono min-h-[140px] border-t border-line p-4 text-[12.5px] leading-6 md:min-h-[280px] md:border-l md:border-t-0">
          <span className="text-dim">{"# output"}</span>
          <pre className="mt-2 whitespace-pre-wrap text-ink">
            {output || (
              <span className="text-dim">Press Run — this executes real Python, live in your browser.</span>
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}
