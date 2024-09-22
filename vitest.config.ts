import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    reporters: ["basic", "junit"],
    outputFile: {
      junit: "junit.xml"
    },
    coverage: {
      all: true,
      reporter: ["text", "cobertura"],
      include: ["src/**"]
    }
  }
});
