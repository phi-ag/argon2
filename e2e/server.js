import { readFile } from "node:fs/promises";
import http from "node:http";
import { resolve } from "node:path";

const port = 3001;

const htmlPath = resolve(import.meta.dirname, "index.html");
const distPath = (req) => resolve(import.meta.dirname, "..", "dist", req.url.slice(1));

http
  .createServer(async (req, res) => {
    if (req.url === "/") {
      res.writeHead(200, { "Content-Type": "text/html" });
      return res.end(await readFile(htmlPath));
    }

    if (req.url === "/favicon.ico") {
      res.writeHead(200);
      return res.end();
    }

    if (req.url.endsWith(".js")) {
      res.writeHead(200, { "Content-Type": "application/javascript" });
      return res.end(await readFile(distPath(req)));
    }

    if (req.url.endsWith(".wasm")) {
      res.writeHead(200, { "Content-Type": "application/wasm" });
      return res.end(await readFile(distPath(req)));
    }

    res.writeHead(404);
    return res.end();
  })
  .listen(port, () => {
    console.log("Listening on port", port);
  });
