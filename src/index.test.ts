import { describe, expect, test } from "vitest";

import { toHex, toUtf8Array } from "./index";
import initializeNode from "./node";

describe("argon2", async () => {
  const argon2 = await initializeNode();

  test("hash password with specific salt", () => {
    const password = "foo";
    const salt = toUtf8Array("asdfasdfasdfasdf");
    const { hash, encoded } = argon2.hash(password, { salt });

    expect(toHex(hash)).toEqual(
      "39c70677735386556fcf5d9db211181b23dfe5bdd4b7d0912327ea719711c3cd"
    );

    expect(encoded).toEqual(
      "$argon2id$v=19$m=65536,t=3,p=4$YXNkZmFzZGZhc2RmYXNkZg$OccGd3NThlVvz12dshEYGyPf5b3Ut9CRIyfqcZcRw80"
    );

    expect(argon2.verify(encoded, password));

    expect(() => argon2.verify(encoded, "not the password")).toThrowError(
      "The password does not match the supplied hash"
    );
  });

  test("hash password with defaults", () => {
    const password = "my secret password";
    const { encoded } = argon2.hash(password);

    expect(argon2.verify(encoded, password));

    expect(() => argon2.verify(encoded, "not my password")).toThrowError(
      "The password does not match the supplied hash"
    );
  });
});
