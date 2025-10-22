import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    reporters: ["default", "junit"],
    outputFile: {
      junit: "junit.xml"
    },
    coverage: {
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.{wasm,bench.ts}"],
      reportsDirectory: "coverage",
      reporter: ["text", "cobertura", "html"]
    }
  }
});
