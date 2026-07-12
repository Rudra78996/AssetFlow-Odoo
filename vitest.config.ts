import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["tests/**/*.test.ts"],
    // Provide the secrets config.ts validates at import time.
    env: {
      JWT_ACCESS_SECRET: "test-access-secret-min-16-chars-long",
      JWT_REFRESH_SECRET: "test-refresh-secret-min-16-chars-long",
      NODE_ENV: "test",
      DATABASE_URL: "mongodb://localhost:27017/assetflow_test?replicaSet=rs0&directConnection=true",
      CRON_SECRET: "test-cron-secret",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/modules/**/*.service.ts", "src/lib/**/*.ts"],
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
});
