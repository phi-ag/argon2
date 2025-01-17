#!/usr/bin/env sh
set -eu

VERSION=4.0.1@sha256:b768192dc2511004995863f9ef910c3e22f700e24d587f0a092d65b872d3b29f

docker run -it --rm \
  --workdir /workdir \
  -v .:/workdir \
  emscripten/emsdk:${VERSION} \
  ./build.sh
