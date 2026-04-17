import { expect, test } from "@playwright/test";

import { throwOnConsoleError } from "./utils";

test("hash and verify", async ({ page }) => {
  throwOnConsoleError(page);

  await page.goto("/");
  await expect(page).toHaveTitle("Argon2 Browser Test");

  const encodedWithSalt = page.locator("#encodedWithSalt");
  await expect(encodedWithSalt).toHaveText(
    "$argon2id$v=19$m=65536,t=3,p=4$YXNkZmFzZGZhc2RmYXNkZg$Z6jf3u1V2pXhzHdPMexmG6mG+i5486N1/fV/nlvUI60"
  );

  const encoded = page.locator("#encoded");
  await expect(encoded).toHaveText(/\$argon2id\$/);

  const success = page.locator("#success");
  await expect(success).toHaveText("true");

  const error = page.locator("#error");
  await expect(error).toHaveText("The password does not match the supplied hash");
});
