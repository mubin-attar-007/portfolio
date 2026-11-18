// Minimal static server for the prototype (no dependencies), local machine only.
// Usage (from the repo root): node spec/prototype/serve.cjs   ->  http://localhost:4321/
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname);
const port = Number(process.env.PORT) || 4321;
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

http
  .createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    if (p.endsWith("/")) p += "index.html";
    const file = path.resolve(root, "." + p);
    if (file !== root && !file.startsWith(root + path.sep)) {
      res.writeHead(403, { "content-type": "text/plain" });
      return res.end("Forbidden");
    }
    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(404, { "content-type": "text/plain" });
        return res.end("Not found");
      }
      res.writeHead(200, { "content-type": types[path.extname(file)] || "application/octet-stream", "cache-control": "no-store" });
      res.end(data);
    });
  })
  .listen(port, "127.0.0.1", () => console.log(`Prototype running at http://localhost:${port}/`));
