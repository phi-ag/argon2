import Argon2 from "./index.js";

export default async function initialize(url: string): Promise<Argon2> {
  const response = await fetch(url);
  const { instance } = await WebAssembly.instantiateStreaming(response);
  return new Argon2(instance);
}
