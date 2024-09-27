import { type ReadStream, createReadStream } from "node:fs";
import http from "node:http";
import { resolve } from "node:path";

const port = process.env.PORT ?? 3001;

const htmlPath = resolve(import.meta.dirname, "index.html");

const distPath = (url: string): string =>
  resolve(import.meta.dirname, "..", "dist", url.slice(1));

const distFile = (url: string): ReadStream => createReadStream(distPath(url));

http
  .createServer(async (req, res) => {
    if (req.url === "/") {
      res.writeHead(200, { "Content-Type": "text/html" });
      return createReadStream(htmlPath).pipe(res);
    }

    if (req.url === "/index.js" || req.url === "/fetch.js") {
      res.writeHead(200, { "Content-Type": "application/javascript" });
      return distFile(req.url).pipe(res);
    }

    if (req.url === "/argon2.wasm") {
      res.writeHead(200, { "Content-Type": "application/wasm" });
      return distFile(req.url).pipe(res);
    }

    if (req.url === "/favicon.ico") {
      res.statusCode = 200;
      return res.end();
    }

    res.statusCode = 404;
    return res.end();
  })
  .listen(port, () => {
    console.log("Listening on port", port);
  });
