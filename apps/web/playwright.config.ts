import { defineConfig, devices } from "@playwright/test";

const API = "http://localhost:3101";
const WEB = "http://localhost:3100";
const DATABASE_URL =
  "postgres://conhecimento:conhecimento@localhost:5433/conhecimento_e2e_test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 90_000,
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: WEB,
    headless: true,
    locale: "pt-BR",
  },
  webServer: [
    {
      command:
        "node apps/api/scripts/prepare-test-db.mjs ensure-fresh && pnpm --filter @conhecimento/api start",
      url: `${API}/api/health`,
      reuseExistingServer: false,
      cwd: "../..",
      timeout: 120_000,
      env: {
        ...process.env,
        DATABASE_URL,
        AI_PROVIDER: "fake",
        PORT: "3101",
        WEB_ORIGIN: WEB,
        VITEST: "",
      },
    },
    {
      command: "pnpm --filter @conhecimento/web exec next dev --port 3100",
      url: WEB,
      reuseExistingServer: false,
      cwd: "../..",
      timeout: 120_000,
      env: {
        ...process.env,
        NEXT_PUBLIC_API_URL: `${API}/api`,
      },
    },
  ],
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
