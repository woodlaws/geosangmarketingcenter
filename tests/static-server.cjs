const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const port = Number(process.env.PORT || 8788);
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp", ".jpg": "image/jpeg", ".jpeg": "image/jpeg" };

http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let pathname = decodeURIComponent(url.pathname);
  if (/^\/support\/notices\/[a-z0-9-]+\/?$/.test(pathname)) pathname = "/support/notices/detail.html";
  if (/^\/support\/resources\/[a-z0-9-]+\/?$/.test(pathname)) pathname = "/support/resources/detail.html";
  let target = path.join(root, pathname.replace(/^\/+/, ""));
  if (pathname.endsWith("/")) target = path.join(target, "index.html");
  else if (!path.extname(target) && fs.existsSync(target + ".html")) target += ".html";
  if (!target.startsWith(root) || !fs.existsSync(target) || fs.statSync(target).isDirectory()) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("Not found");
  }
  res.writeHead(200, { "Content-Type": types[path.extname(target).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-store" });
  fs.createReadStream(target).pipe(res);
}).listen(port, "127.0.0.1", () => console.log(`Static server http://127.0.0.1:${port}`));
