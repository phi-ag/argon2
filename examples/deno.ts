//import initialize from "jsr:@peterhirn/test@0.0.5/node";
import Argon2 from "jsr:@peterhirn/test@0.0.5";
import wasm from "jsr:@peterhirn/test@0.0.5/argon2.wasm";

const argon2 = await Argon2.initializeModule(wasm);

//const argon2 = await initialize();

const password = "my secret password";
const { encoded } = argon2.hash(password);

argon2.verify(encoded, password);
