import { resolve } from "node:path";

import { Enums, Factories, Models, Serialize, Spec } from "@cyclonedx/cyclonedx-library";
import { PackageURL } from "packageurl-js";
import { v7 as uuidv7 } from "uuid";

import packageJson from "../package.json" with { type: "json" };
import {
  argon2GitSubmodule,
  emscriptenContainer,
  sha1File,
  sha256File
} from "./utils.ts";

const lFac = new Factories.LicenseFactory();

const { SOURCE_DATE_EPOCH } = process.env;

const sourceDateEpoch = SOURCE_DATE_EPOCH
  ? new Date(Number(SOURCE_DATE_EPOCH) * 1000)
  : new Date(0);

const bom = new Models.Bom();
bom.serialNumber = `urn:uuid:${uuidv7({ msecs: sourceDateEpoch.getTime() })}`;

const purl = PackageURL.fromString(`pkg:npm/${packageJson.name}@${packageJson.version}`);

bom.metadata.timestamp = sourceDateEpoch;

bom.metadata.component = new Models.Component(
  Enums.ComponentType.Library,
  packageJson.name,
  {
    version: packageJson.version,
    description: packageJson.description,
    bomRef: purl.toString(),
    purl
  }
);
bom.metadata.component.licenses.add(lFac.makeFromString(packageJson.license));

bom.metadata.component.externalReferences.add(
  new Models.ExternalReference(
    packageJson.repository.url,
    Enums.ExternalReferenceType.VCS
  )
);

const gitHubUrl = packageJson.repository.url.slice(4, -4);
const distributionUrl = `${gitHubUrl}/releases/download/v${packageJson.version}/argon2.wasm`;
const wasmFile = resolve(import.meta.dirname, "..", "src", "argon2.wasm");

bom.metadata.component.externalReferences.add(
  new Models.ExternalReference(
    distributionUrl,
    Enums.ExternalReferenceType.Distribution,
    {
      hashes: new Models.HashDictionary([
        [Enums.HashAlgorithm["SHA-1"], await sha1File(wasmFile)],
        [Enums.HashAlgorithm["SHA-256"], await sha256File(wasmFile)]
      ])
    }
  )
);

const argon2Git = argon2GitSubmodule();

const argon2Purl = PackageURL.fromString(
  `pkg:generic/P-H-C/phc-winner-argon2@${argon2Git.version}`
);

const argon2 = new Models.Component(
  Enums.ComponentType.Library,
  "P-H-C/phc-winner-argon2",
  {
    version: argon2Git.version,
    bomRef: argon2Purl.toString(),
    purl: argon2Purl
  }
);

argon2.externalReferences.add(
  new Models.ExternalReference(
    "git+https://github.com/P-H-C/phc-winner-argon2.git",
    Enums.ExternalReferenceType.VCS
  )
);

bom.components.add(argon2);

const em = await emscriptenContainer();

const emPurl = PackageURL.fromString(
  `pkg:generic/${em.name}@${em.version.slice(0, em.version.indexOf("@"))}`
);

const emscripten = new Models.Component(Enums.ComponentType.Container, em.name, {
  version: em.version,
  bomRef: emPurl.toString(),
  purl: emPurl
});

emscripten.externalReferences.add(
  new Models.ExternalReference(
    "https://emscripten.org/",
    Enums.ExternalReferenceType.Website
  )
);

emscripten.externalReferences.add(
  new Models.ExternalReference(
    "git+https://github.com/emscripten-core/emscripten.git",
    Enums.ExternalReferenceType.VCS
  )
);

bom.components.add(emscripten);

const nodePurl = PackageURL.fromString(`pkg:generic/node@${process.version.slice(1)}`);

const node = new Models.Component(Enums.ComponentType.Application, "node", {
  version: process.version.slice(1),
  bomRef: nodePurl.toString(),
  purl: nodePurl
});

node.externalReferences.add(
  new Models.ExternalReference(process.execPath, Enums.ExternalReferenceType.Other, {
    hashes: new Models.HashDictionary([
      [Enums.HashAlgorithm["SHA-1"], await sha1File(process.execPath)],
      [Enums.HashAlgorithm["SHA-256"], await sha256File(process.execPath)]
    ])
  })
);

node.externalReferences.add(
  new Models.ExternalReference("https://nodejs.org/", Enums.ExternalReferenceType.Website)
);

node.externalReferences.add(
  new Models.ExternalReference(
    "git+https://github.com/nodejs/node.git",
    Enums.ExternalReferenceType.VCS
  )
);

bom.components.add(node);

const pnpmPurl = PackageURL.fromString(
  `pkg:generic/${packageJson.packageManager.slice(0, packageJson.packageManager.indexOf("+"))}`
);

const pnpm = new Models.Component(Enums.ComponentType.Application, "pnpm", {
  version: packageJson.packageManager.slice(packageJson.packageManager.indexOf("@") + 1),
  bomRef: pnpmPurl.toString(),
  purl: pnpmPurl
});

pnpm.externalReferences.add(
  new Models.ExternalReference("https://pnpm.io/", Enums.ExternalReferenceType.Website)
);

pnpm.externalReferences.add(
  new Models.ExternalReference(
    "git+https://github.com/pnpm/pnpm.git",
    Enums.ExternalReferenceType.VCS
  )
);

bom.components.add(pnpm);

const jsonSerializer = new Serialize.JsonSerializer(
  new Serialize.JSON.Normalize.Factory(Spec.Spec1dot6)
);

console.log(jsonSerializer.serialize(bom));
