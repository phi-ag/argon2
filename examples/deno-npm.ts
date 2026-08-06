import initialize from "npm:@phi-ag/argon2/node";

const argon2 = await initialize();
console.log(argon2.hash("my secret password"));
