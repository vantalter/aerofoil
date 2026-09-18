#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "$0")/.." && pwd)"
version="$(node -p "require('${project_root}/manifest.json').version")"
archive="${project_root}/dist/aerofoil-${version}.zip"

node "${project_root}/scripts/validate.mjs"
mkdir -p "${project_root}/dist"

(
  cd "${project_root}"
  zip -q -FS -r "${archive}" manifest.json img
)

unzip -tq "${archive}"
echo "Created ${archive}"
