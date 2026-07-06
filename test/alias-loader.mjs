// Tiny ESM resolve hook so the Node test runner understands (a) the "@/..." path
// alias defined in tsconfig ("@/*" -> "./*") and (b) extensionless relative TS
// imports like `import "./schema"` (which Next/tsx resolve but raw Node ESM does
// not). Preloaded via --import in the "test" npm script. Keeps tests runnable
// with plain `node --test` (no bundler) — what lets the grounding proof run at
// zero LLM quota.

import { pathToFileURL, fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import { register } from "node:module";

const projectRoot = new URL("../", import.meta.url); // repo root (test/ is one down)
const TS_EXTS = [".ts", ".tsx"];

/** If `urlHref` points at a nonexistent file, try the TS variants Next would. */
function withTsExtension(urlHref) {
  let p;
  try {
    p = fileURLToPath(urlHref);
  } catch {
    return urlHref;
  }
  if (existsSync(p)) return urlHref;
  for (const ext of TS_EXTS) {
    if (existsSync(p + ext)) return pathToFileURL(p + ext).href;
  }
  for (const ext of TS_EXTS) {
    const idx = `${p.replace(/[/\\]?$/, "/")}index${ext}`;
    if (existsSync(idx)) return pathToFileURL(idx).href;
  }
  return urlHref;
}

const HAS_EXT = /\.[mc]?[jt]sx?$|\.json$|\.node$/i;

export async function resolve(specifier, context, nextResolve) {
  // For .json imports written WITHOUT an import attribute (TS/Next tolerate
  // this; raw Node requires `with { type: "json" }`), inject the attribute so
  // resolution/loading succeeds under the plain test runner.
  const isJson = specifier.endsWith(".json");
  const patchedContext = isJson
    ? { ...context, importAttributes: { ...context.importAttributes, type: "json" } }
    : context;

  if (specifier.startsWith("@/")) {
    const target = new URL(specifier.slice(2), projectRoot);
    return nextResolve(withTsExtension(target.href), patchedContext);
  }

  // Extensionless relative TS import (e.g. "./schema") — resolve to the .ts file.
  if ((specifier.startsWith("./") || specifier.startsWith("../")) && !HAS_EXT.test(specifier)) {
    if (context.parentURL) {
      const target = new URL(specifier, context.parentURL);
      return nextResolve(withTsExtension(target.href), patchedContext);
    }
  }

  return nextResolve(specifier, patchedContext);
}

export async function load(url, context, nextLoad) {
  // Ensure .json modules load even when the importing source omitted the
  // `with { type: "json" }` attribute (TS/Next tolerate the omission).
  if (url.endsWith(".json")) {
    return nextLoad(url, {
      ...context,
      importAttributes: { ...context.importAttributes, type: "json" },
    });
  }
  return nextLoad(url, context);
}

// Allow this file to be used both as an --import preloader and as a loader.
if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  // no-op when run directly
} else {
  try {
    register(import.meta.url);
  } catch {
    // If registration fails (already registered), ignore.
  }
}
