import { createReadStream, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const fixturesRoot = resolve(repoRoot, "fixtures");
const port = Number(process.env.FIXTURES_PORT ?? 4179);
const contentTypes = { ".html": "text/html; charset=utf-8", ".txt": "text/plain; charset=utf-8", ".md": "text/markdown; charset=utf-8" };

const server = createServer((request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" }).end("Method not allowed");
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
  } catch {
    response.writeHead(400).end("Invalid path");
    return;
  }

  if (pathname === "/" || pathname === "/index.html") {
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    response.end("<!doctype html><html lang=\"es\"><meta charset=\"utf-8\"><title>Fixtures locales</title><ul><li><a href=\"/prechecked-basic.html\">Casillas premarcadas</a></li><li><a href=\"/clean-form.html\">Formulario limpio</a></li></ul>");
    return;
  }

  const filename = resolve(fixturesRoot, `.${pathname}`);
  if (!filename.startsWith(`${fixturesRoot}${sep}`) || !statSyncSafe(filename)) {
    response.writeHead(404).end("Fixture not found");
    return;
  }

  response.writeHead(200, { "Content-Type": contentTypes[extname(filename)] ?? "application/octet-stream", "X-Content-Type-Options": "nosniff" });
  if (request.method === "HEAD") response.end();
  else createReadStream(filename).pipe(response);
});

function statSyncSafe(filename) {
  try { return statSync(filename).isFile(); } catch { return false; }
}

server.listen(port, "127.0.0.1", () => {
  console.log(`Fixtures disponibles en http://localhost:${port}`);
});
