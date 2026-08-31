import { defineConfig } from "vitest/config";
import swc from "unplugin-swc";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    fileParallelism: false,
    env: {
      DATABASE_URL:
        "postgres://conhecimento:conhecimento@localhost:5433/conhecimento_test",
      AI_PROVIDER: "fake",
    },
    include: ["src/**/*.spec.ts", "test/**/*.spec.ts"],
    testTimeout: 30000,
    hookTimeout: 30000,
  },
  plugins: [
    swc.vite({
      jsc: {
        parser: { syntax: "typescript", decorators: true },
        transform: { legacyDecorator: true, decoratorMetadata: true },
      },
    }),
  ],
});
