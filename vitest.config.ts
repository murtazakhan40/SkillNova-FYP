import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    setupFiles: ["tests/setup/test-env.ts"],
    testTimeout: 30000,
    hookTimeout: 60000,
    fileParallelism: false, // Run sequentially to protect database from concurrent locking
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
