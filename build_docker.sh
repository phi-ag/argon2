#!/usr/bin/env sh
set -eu

VERSION=6.0.2@sha256:644883f58ca15c38c8be59b3a727ba0eff347729bc31d50a3348a6c9ed92bc07

docker run -it --rm \
  --workdir /workdir \
  -v .:/workdir \
  emscripten/emsdk:${VERSION} \
  ./build.sh
