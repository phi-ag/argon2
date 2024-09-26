import { expect, test } from "@playwright/test";

import { throwOnConsoleError } from "./utils";

test("hash and verify", async ({ page }) => {
  throwOnConsoleError(page);

  await page.goto("/");
  await expect(page).toHaveTitle("Argon2 Browser Test");

  const encoded = page.locator("#encoded");
  await expect(encoded).toHaveText(/\$argon2id\$/);

  const success = page.locator("#success");
  await expect(success).toHaveText("true");

  const error = page.locator("#error");
  await expect(error).toHaveText("The password does not match the supplied hash");
});
