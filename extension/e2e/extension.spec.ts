import { test, expect, chromium } from "@playwright/test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

const extensionPath = join(process.cwd(), "dist");
const fixtureUrl = "http://localhost:4179/prechecked-basic.html";
let profile: string;
let server: ReturnType<typeof spawn>;

test.beforeAll(async () => {
  profile = await mkdtemp(join(tmpdir(), "contrabandista-profile-"));
  server = spawn(process.execPath, ["scripts/serve-fixtures.mjs"], { stdio: "ignore", env: { ...process.env, FIXTURES_PORT: "4179" } });
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    const startedAt = Date.now();
    const poll = setInterval(async () => {
      try {
        const response = await fetch(fixtureUrl);
        if (response.ok) {
          clearInterval(poll);
          resolve();
        }
      } catch {
        if (Date.now() - startedAt > 10_000) {
          clearInterval(poll);
          reject(new Error("El servidor de fixtures no inició a tiempo"));
        }
      }
    }, 100);
  });
});

test.afterAll(async () => {
  server?.kill();
  if (profile) await rm(profile, { recursive: true, force: true });
});

test("detecta la fixture y resalta el checkbox desde el panel", async () => {
  const context = await chromium.launchPersistentContext(profile, {
    headless: true,
    channel: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? undefined : "chromium",
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
  });
  try {
    const page = await context.newPage();
    await page.goto(fixtureUrl);
    const worker = context.serviceWorkers()[0] ?? await context.waitForEvent("serviceworker");
    const pageTabId = await worker.evaluate(async () => (await chrome.tabs.query({ active: true, lastFocusedWindow: true }))[0]?.id);
    expect(pageTabId).toBeDefined();
    await expect.poll(async () => worker.evaluate(async (tabId) => {
      const entry = (await chrome.storage.session.get(`findings-${tabId}`))[`findings-${tabId}`];
      return Array.isArray(entry) ? entry.length : 0;
    }, pageTabId!)).toBe(2);

    const extensionId = new URL(worker.url()).host;
    const panel = await context.newPage();
    await panel.goto(`chrome-extension://${extensionId}/src/panel/panel.html?tabId=${pageTabId}`);
    await expect(panel.getByRole("heading", { name: "Casilla premarcada · 92%" }).first()).toBeVisible();
    await expect(panel.getByText("Evidencia: “Quiero recibir el boletín y ofertas por correo”")).toBeVisible();
    await panel.getByRole("button", { name: "Resaltar" }).first().click();
    await expect(page.locator("#newsletter")).toHaveCSS("outline-style", "solid");
    await expect(page.locator("#newsletter")).toHaveCSS("outline-color", "rgb(215, 25, 32)");
  } finally {
    await context.close();
  }
});
