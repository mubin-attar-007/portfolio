import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const openNext = join(root, ".open-next");
const dist = join(root, "dist");
const server = join(dist, "server");
const assets = join(openNext, "assets");
const client = join(dist, "client");

await rm(dist, { recursive: true, force: true });
await mkdir(server, { recursive: true });
await cp(assets, client, { recursive: true });

// OpenNext's prerender cache already contains the complete HTML for every
// portfolio route. Materialize it as static assets so the production Worker
// remains comfortably below the host's 10 MiB upload limit.
const cacheRoot = join(openNext, "cache");
const [buildId] = await readdir(cacheRoot);
const cacheFiles = await readdir(join(cacheRoot, buildId), { recursive: true });

for (const file of cacheFiles) {
  if (!file.endsWith(".cache")) continue;

  const cached = JSON.parse(
    await readFile(join(cacheRoot, buildId, file), "utf8"),
  );
  if (typeof cached.html !== "string") continue;

  const route = file.slice(0, -".cache".length);
  if (route.startsWith("_")) continue;

  const output =
    route === "index"
      ? join(client, "index.html")
      : join(client, ...route.split(/[\\/]/), "index.html");
  await mkdir(join(output, ".."), { recursive: true });
  await writeFile(output, cached.html, "utf8");
}

await writeFile(
  join(server, "index.js"),
  [
    "export default {",
    "  async fetch(request, env) {",
    "    const url = new URL(request.url);",
    "    if (!url.pathname.includes('.') && !url.pathname.endsWith('/')) {",
    "      url.pathname += '/';",
    "      return Response.redirect(url, 308);",
    "    }",
    "    return env.ASSETS.fetch(new Request(url, request));",
    "  },",
    "};",
    "",
  ].join("\n"),
  "utf8",
);
