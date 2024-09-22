import { describe, expect, test } from "vitest";

import Argon2, { encodeUtf8, toHex } from ".";

describe("argon2", async () => {
  const argon2 = await Argon2.initialize();

  test("hash example password with defaults", () => {
    const salt = encodeUtf8("asdfasdfasdfasdf");
    const { hash, encoded } = argon2.hash("foo", { salt });

    expect(toHex(hash)).toEqual(
      "39c70677735386556fcf5d9db211181b23dfe5bdd4b7d0912327ea719711c3cd"
    );

    expect(encoded).toEqual(
      "$argon2id$v=19$m=65536,t=3,p=4$YXNkZmFzZGZhc2RmYXNkZg$OccGd3NThlVvz12dshEYGyPf5b3Ut9CRIyfqcZcRw80"
    );
  });
});
