#!/usr/bin/env sh
set -eu

VERSION=4.0.11@sha256:f8a157011b8fa61bdaab875bb1f0f08695229dffe086448d14b53538cae16bd3

docker run -it --rm \
  --workdir /workdir \
  -v .:/workdir \
  emscripten/emsdk:${VERSION} \
  ./build.sh
