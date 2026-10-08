import { defineConfig } from "@playwright/test";
export default defineConfig({ testDir: "./extension/e2e", timeout: 30000, workers: 1, reporter: "list" });
