#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "$0")/.." && pwd)"
version="$(node -p "require(process.argv[1]).version" "${project_root}/manifest.json")"
archive="${project_root}/dist/aerofoil-${version}.zip"

node "${project_root}/scripts/validate.mjs"
mkdir -p "${project_root}/dist"

(
  cd "${project_root}"
  zip -q -FS -r "${archive}" manifest.json img -x "*.DS_Store"
)

unzip -tq "${archive}"
echo "Created ${archive}"
