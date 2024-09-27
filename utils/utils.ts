import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import readline from "node:readline/promises";
import { pipeline } from "node:stream/promises";

// NOTE: should be `import packageJson from "../package.json" with { type: "json" };`
// see https://github.com/trivago/prettier-plugin-sort-imports/issues/270
export const packageJson = await JSON.parse(
  String(await readFile(resolve(import.meta.dirname, "..", "package.json")))
);

export const argon2GitSubmodule = () => {
  const result = execSync("git submodule status phc-winner-argon2").toString().trim();
  const [version, name, tag] = result.split(" ");
  return { name, version, tag: tag.slice(1, -1) };
};

export const emscriptenContainer = async () => {
  const path = resolve(
    import.meta.dirname,
    "..",
    ".github",
    "actions",
    "emscripten",
    "action.yml"
  );

  const lines = readline.createInterface({
    input: createReadStream(path),
    crlfDelay: Infinity
  });

  for await (const line of lines) {
    const needle = "docker://";
    const match = line.indexOf(needle);
    if (match !== -1) {
      const image = line.slice(match + needle.length);
      const colon = image.indexOf(":");
      return { name: image.slice(0, colon), version: image.slice(colon + 1) };
    }
  }

  throw Error("Missing emscripten container");
};

export const sha1File = async (path: string): Promise<string> => {
  const stream = createReadStream(path);
  const hash = createHash("sha1");
  hash.setEncoding("hex");

  await pipeline(stream, hash);

  hash.end();
  return hash.read();
};

export const sha256File = async (path: string): Promise<string> => {
  const stream = createReadStream(path);
  const hash = createHash("sha256");
  hash.setEncoding("hex");

  await pipeline(stream, hash);

  hash.end();
  return hash.read();
};
