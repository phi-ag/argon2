import { resolve } from "node:path";

import { Enums, Factories, Models, Serialize, Spec } from "@cyclonedx/cyclonedx-library";
import { PackageURL } from "packageurl-js";

import {
  argon2GitSubmodule,
  emscriptenContainer,
  packageJson,
  sha1File,
  sha256File
} from "./utils.ts";

const lFac = new Factories.LicenseFactory();

const bom = new Models.Bom();
bom.serialNumber = `urn:uuid:${crypto.randomUUID()}`;

const purl = PackageURL.fromString(`pkg:npm/${packageJson.name}@${packageJson.version}`);

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
  `pkg:git/${argon2Git.name}@${argon2Git.version}`
);

const argon2 = new Models.Component(Enums.ComponentType.Library, argon2Git.name, {
  version: argon2Git.version,
  bomRef: argon2Purl.toString(),
  purl: argon2Purl
});

argon2.externalReferences.add(
  new Models.ExternalReference(
    "git+https://github.com/P-H-C/phc-winner-argon2.git",
    Enums.ExternalReferenceType.VCS
  )
);

bom.components.add(argon2);

const em = await emscriptenContainer();

const emPurl = PackageURL.fromString(
  `pkg:container/${em.name}@${em.version.slice(0, em.version.indexOf("@"))}`
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

const jsonSerializer = new Serialize.JsonSerializer(
  new Serialize.JSON.Normalize.Factory(Spec.Spec1dot6)
);

console.log(jsonSerializer.serialize(bom));
