import { readFile } from "node:fs/promises";

import test, { type Page } from "@playwright/test";

export const throwOnConsoleError = (page: Page) => {
  page.on("console", (message) => {
    switch (message.type()) {
      case "error":
        throw message;
      case "warning":
    }
  });

  page.on("pageerror", (error) => {
    throw error;
  });
};

export const addReportUrl = (path: string) => {
  if (process.env.ARTIFACTS_URL) {
    test.info().annotations.push({
      type: "report",
      description: `${process.env.ARTIFACTS_URL}${path}`
    });
  }
};

export const attachJson = (name: string, json: unknown) =>
  test.info().attach(name, {
    body: JSON.stringify(json, null, 2),
    contentType: "application/json"
  });

export const attachJsonFile = async (name: string, path: string) => {
  const body = await readFile(path, "utf8");

  test.info().attach(name, {
    body,
    contentType: "application/json"
  });
};
