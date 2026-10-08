import { test, expect, chromium } from "@playwright/test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
const extensionPath = join(process.cwd(), "dist");
let profile: string; let server: ReturnType<typeof spawn>;
test.beforeAll(async () => {
 profile = await mkdtemp(join(tmpdir(), "contrabandista-profile-"));
 server = spawn(process.execPath, ["-e", "require('http').createServer((req,res)=>{res.setHeader('content-type','text/html');res.end('<!doctype html><title>Compra de prueba</title><h1>Local</h1>')}).listen(4179,'127.0.0.1')"], { stdio: "ignore" });
 await new Promise<void>((resolve, reject) => { server.once("error", reject); const poll = setInterval(async () => { try { await fetch("http://127.0.0.1:4179"); clearInterval(poll); resolve(); } catch { /* espera al servidor local */ } }, 100); });
});
test.afterAll(async () => { server?.kill(); if (profile) await rm(profile, { recursive: true, force: true }); });
test("carga la extensión y muestra título y URL de página local en el panel", async () => {
 const context = await chromium.launchPersistentContext(profile, { headless: true, channel: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? undefined : "chromium", executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE, args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`] });
 try { const page = await context.newPage(); await page.goto("http://127.0.0.1:4179"); const worker = context.serviceWorkers()[0] ?? await context.waitForEvent("serviceworker"); const extensionId = new URL(worker.url()).host; const pageTabId = await worker.evaluate(async () => (await chrome.tabs.query({ active: true, lastFocusedWindow: true }))[0]?.id); const panel = await context.newPage(); await panel.goto(`chrome-extension://${extensionId}/src/panel/panel.html?tabId=${pageTabId}`); await expect(panel.getByRole("heading", { name: "El Contrabandista — hola" })).toBeVisible(); await expect(panel.locator("#page-info")).toContainText("Compra de prueba"); await expect(panel.locator("#page-info")).toContainText("http://127.0.0.1:4179/"); } finally { await context.close(); }
});
