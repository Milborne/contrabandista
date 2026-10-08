import { defineConfig } from "vite";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.json";
import { fileURLToPath } from "node:url";
const extensionRoot = fileURLToPath(new URL(".", import.meta.url));
export default defineConfig({ root: extensionRoot, plugins: [crx({ manifest })], build: { outDir: "../dist", emptyOutDir: true }, server: { host: "127.0.0.1" } });
