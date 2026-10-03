#!/usr/bin/env sh
set -eu

VERSION=6.0.11@sha256:cdefec943f04fd4b2b2fe23b0a1a346be9fc560ef5784a83faa27dd351381372

docker run -it --rm \
  --workdir /workdir \
  -v .:/workdir \
  emscripten/emsdk:${VERSION} \
  ./build.sh
