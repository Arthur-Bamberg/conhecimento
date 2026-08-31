import { defineConfig, devices } from "@playwright/test";

const API = "http://localhost:3001";
const WEB = "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e",
  timeout: 90_000,
  fullyParallel: false,
  use: {
    baseURL: WEB,
    headless: true,
    locale: "pt-BR",
  },
  webServer: [
    {
      command: "pnpm --filter @conhecimento/api start",
      url: `${API}/api/health`,
      reuseExistingServer: true,
      cwd: "../..",
      timeout: 120_000,
      env: {
        ...process.env,
        DATABASE_URL:
          "postgres://conhecimento:conhecimento@localhost:5433/conhecimento",
        AI_PROVIDER: "fake",
        PORT: "3001",
        WEB_ORIGIN: WEB,
      },
    },
    {
      command: "pnpm --filter @conhecimento/web dev",
      url: WEB,
      reuseExistingServer: true,
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
