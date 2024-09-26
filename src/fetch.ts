import Argon2 from "./index.js";

const initializeFetch = async (url: string): Promise<Argon2> =>
  Argon2.initialize(async (imports) => {
    const response = await fetch(url);
    const { instance } = await WebAssembly.instantiateStreaming(response, imports);
    return instance;
  });

export default initializeFetch;
