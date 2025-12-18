#!/usr/bin/env sh
set -eu

VERSION=4.0.22@sha256:a08b927777707813e64af195db105f935bd554f5825606b2048031151a9635f5

docker run -it --rm \
  --workdir /workdir \
  -v .:/workdir \
  emscripten/emsdk:${VERSION} \
  ./build.sh
