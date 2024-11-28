#!/usr/bin/env sh
set -eu

VERSION=3.1.73@sha256:a2abf158f65e3024da9883bac1d20bfc4ed936539293edff5469ca20b4a5dc90

docker run -it --rm \
  --workdir /workdir \
  -v .:/workdir \
  emscripten/emsdk:${VERSION} \
  ./build.sh
