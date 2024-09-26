#!/usr/bin/env sh
set -eu

corepack enable
corepack prepare --activate
pnpm config set store-dir .pnpm-store
pnpm install --frozen-lockfile

pnpm test:e2e