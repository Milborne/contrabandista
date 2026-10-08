import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
const root = "extension/src";
const forbidden = [/\bfetch\s*\(/, /\bXMLHttpRequest\b/, /\bWebSocket\s*\(/, /\bEventSource\s*\(/, /\bsendBeacon\s*\(/];
function walk(dir) { return readdirSync(dir).flatMap((name) => { const file = join(dir, name); return statSync(file).isDirectory() ? walk(file) : [file]; }); }
const hits = [];
for (const file of walk(root).filter((file) => /\.(ts|js|html)$/.test(file))) { const source = readFileSync(file, "utf8"); for (const pattern of forbidden) if (pattern.test(source)) hits.push(`${file}: posible llamada de red ${pattern}`); }
if (hits.length) { console.error(hits.join("\n")); process.exit(1); }
console.log("Privacidad: no se encontraron APIs de red saliente en extension/src.");
