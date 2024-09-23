import Argon2, { type Argon2Module } from "./index.js";

const initializeFetch = async (
  url: string,
  overrides?: Partial<Argon2Module>
): Promise<Argon2> => {
  const response = await fetch(url);
  return await Argon2.initializeStreaming(response, overrides);
};

export default initializeFetch;
