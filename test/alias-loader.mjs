// Tiny ESM resolve hook so the Node test runner understands the "@/..." path
// alias defined in tsconfig ("@/*" -> "./*"). Preloaded via --import in the
// "test" npm script. Keeps tests runnable with plain `node --test` (no bundler),
// which is what lets the retrieval grounding proof run at zero LLM quota.

import { pathToFileURL } from "node:url";
import { register } from "node:module";

const projectRoot = new URL("../", import.meta.url); // repo root (test/ is one down)

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
    return nextResolve(target.href, patchedContext);
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
