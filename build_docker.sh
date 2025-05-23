#!/usr/bin/env sh
set -eu

VERSION=4.0.9@sha256:3c853ef9c3b4c2708da1adac2fdfdba49c775fdc4144ceef4989423963e96811

docker run -it --rm \
  --workdir /workdir \
  -v .:/workdir \
  emscripten/emsdk:${VERSION} \
  ./build.sh
