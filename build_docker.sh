#!/usr/bin/env sh
set -eu

VERSION=3.1.72@sha256:cb4535c7f341ff2c58936e40b4088c929240bdb787e64eb855590e1dcea44923

docker run -it --rm \
  --workdir /workdir \
  -v .:/workdir \
  emscripten/emsdk:${VERSION} \
  ./build.sh
