import { describe, expect, test } from "vitest";

import { Argon2Type, Argon2Version, toHex, toUtf8Array, typeFromEncoded } from "./index";
import initializeNode from "./node";

describe("argon2", async () => {
  const argon2 = await initializeNode();
  const p = "my secret password";

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
    const { encoded } = argon2.hash(p);
    expect(argon2.verify(encoded, p));

    expect(() => argon2.verify(encoded, "not my password")).toThrowError(
      "The password does not match the supplied hash"
    );

    expect(argon2.tryVerify(encoded, "not the password")).toEqual({
      success: false,
      error: "The password does not match the supplied hash"
    });
  });

  test("hash password with hash length", () => {
    expect(argon2.tryHash(p, { hashLength: 4 }).success).toBeTruthy();
    expect(argon2.tryHash(p, { hashLength: 1000 }).success).toBeTruthy();

    const error = "Hash length is too small";
    expect(argon2.tryHash(p, { hashLength: -1 }).error).toEqual(error);
    expect(argon2.tryHash(p, { hashLength: 0 }).error).toEqual(error);
    expect(argon2.tryHash(p, { hashLength: 1 }).error).toEqual(error);

    const typeError = "Hash length must be an integer";
    // @ts-expect-error
    expect(argon2.tryHash(p, { hashLength: null }).error).toEqual(typeError);
    expect(argon2.tryHash(p, { hashLength: 55.2 }).error).toEqual(typeError);

    expect(() => argon2.hash(p, { hashLength: 55.2 })).toThrowError(typeError);
  });

  test("hash password with salt", () => {
    const salt8 = Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 0]);
    expect(argon2.tryHash(p, { salt: salt8 }).success).toBeTruthy();

    const error = "Salt length is too small";
    expect(argon2.tryHash(p, { salt: Uint8Array.from([]) }).error).toEqual(error);

    const salt7 = Uint8Array.from([0, 0, 0, 0, 0, 0, 0]);
    expect(argon2.tryHash(p, { salt: salt7 }).error).toEqual(error);

    // @ts-expect-error
    expect(argon2.tryHash(p, { salt: "asdf" }).error).toEqual(
      "Salt must be of type Uint8Array"
    );
  });

  test("hash password with timecost", () => {
    expect(argon2.tryHash(p, { timeCost: 1 }).success).toBeTruthy();

    const error = "Time cost is too small";
    expect(argon2.tryHash(p, { timeCost: 0 }).error).toEqual(error);
    expect(argon2.tryHash(p, { timeCost: -1 }).error).toEqual(error);

    const typeError = "Time cost must be an integer";
    // @ts-expect-error
    expect(argon2.tryHash(p, { timeCost: null }).error).toEqual(typeError);
    expect(argon2.tryHash(p, { timeCost: 4.3 }).error).toEqual(typeError);
  });

  test("hash password with memorycost", () => {
    expect(argon2.tryHash(p, { memoryCost: 32 }).success).toBeTruthy();

    const error = "Memory cost is too small";
    expect(argon2.tryHash(p, { memoryCost: 0 }).error).toEqual(error);
    expect(argon2.tryHash(p, { memoryCost: 31 }).error).toEqual(error);
    expect(argon2.tryHash(p, { memoryCost: -1 }).error).toEqual(error);

    const typeError = "Memory cost must be an integer";
    // @ts-expect-error
    expect(argon2.tryHash(p, { memoryCost: null }).error).toEqual(typeError);
    expect(argon2.tryHash(p, { memoryCost: 50.1 }).error).toEqual(typeError);
  });

  test("hash password with parallelism", () => {
    expect(argon2.tryHash(p, { parallelism: 2 }).success).toBeTruthy();

    const error = "Parallelism is too small";
    expect(argon2.tryHash(p, { parallelism: 0 }).error).toEqual(error);
    expect(argon2.tryHash(p, { parallelism: -1 }).error).toEqual(error);

    const typeError = "Parallelism must be an integer";
    // @ts-expect-error
    expect(argon2.tryHash(p, { parallelism: null }).error).toEqual(typeError);
    expect(argon2.tryHash(p, { parallelism: 6.9 }).error).toEqual(typeError);
  });

  test("hash password with type", () => {
    expect(argon2.tryHash(p, { type: Argon2Type.Argon2i }).success).toBeTruthy();
    expect(argon2.tryHash(p, { type: Argon2Type.Argon2d }).success).toBeTruthy();
    expect(argon2.tryHash(p, { type: Argon2Type.Argon2id }).success).toBeTruthy();

    // @ts-expect-error
    expect(argon2.tryHash(p, { type: -1 }).error).toEqual("Invalid type");

    // @ts-expect-error
    expect(argon2.tryHash(p, { type: 4 }).error).toEqual("Invalid type");
  });

  test("hash password with version", () => {
    expect(argon2.tryHash(p, { version: Argon2Version.Version10 }).success).toBeTruthy();
    expect(argon2.tryHash(p, { version: Argon2Version.Version13 }).success).toBeTruthy();

    // @ts-expect-error
    expect(argon2.tryHash(p, { version: -1 }).error).toEqual("Invalid version");

    // @ts-expect-error
    expect(argon2.tryHash(p, { version: 69 }).error).toEqual("Invalid version");
  });

  test("hash password with error returned from wasm", () => {
    const error = "Memory cost is too small";
    expect(argon2.tryHash(p, { parallelism: 10_000 }).error).toEqual(error);
  });

  test("parse type from encoded string", () => {
    const encoded =
      "$argon2id$v=19$m=65536,t=3,p=4$YXNkZmFzZGZhc2RmYXNkZg$OccGd3NThlVvz12dshEYGyPf5b3Ut9CRIyfqcZcRw80";

    expect(typeFromEncoded(encoded)).toEqual(Argon2Type.Argon2id);
    expect(typeFromEncoded("$argon2i$v=19...")).toEqual(Argon2Type.Argon2i);
    expect(typeFromEncoded("$argon2d$v=19...")).toEqual(Argon2Type.Argon2d);
    expect(typeFromEncoded("$ARGON2D$v=19...")).toEqual(Argon2Type.Argon2d);

    expect(typeFromEncoded("$argon2x$v=19...")).toBeUndefined();
    expect(typeFromEncoded("")).toBeUndefined();
    expect(typeFromEncoded("$")).toBeUndefined();
    // @ts-expect-error
    expect(typeFromEncoded(null)).toBeUndefined();
    // @ts-expect-error
    expect(typeFromEncoded(21323)).toBeUndefined();
  });

  test("verify password with type", () => {
    const encoded =
      "$argon2id$v=19$m=65536,t=3,p=4$YXNkZmFzZGZhc2RmYXNkZg$OccGd3NThlVvz12dshEYGyPf5b3Ut9CRIyfqcZcRw80";

    expect(argon2.tryVerify(encoded, "foo").success).toBeTruthy();
    expect(argon2.tryVerify(encoded, "foo", Argon2Type.Argon2id).success).toBeTruthy();
    expect(argon2.tryVerify(encoded, "foo", Argon2Type.Argon2i).error).toEqual(
      "Decoding failed"
    );
    expect(argon2.tryVerify(encoded, "foo", Argon2Type.Argon2d).error).toEqual(
      "Decoding failed"
    );
    // @ts-expect-error
    expect(argon2.tryVerify(encoded, "foo", -1).error).toEqual("Invalid type");
    // @ts-expect-error
    expect(argon2.tryVerify(encoded, "foo", "not-a-type").error).toEqual("Invalid type");
  });
});
