#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT_DIR"

echo "Installing dependencies (fresh install)..."
if [ -f package-lock.json ]; then
  npm ci --prefer-offline --no-audit --progress=false
else
  npm install --prefer-offline --no-audit --progress=false
fi

echo "Cleaning up dev caches to reduce size..."
rm -rf .npm/_cacache || true

TIMESTAMP=$(date +%Y%m%d%H%M%S)
OUT="path360-full-offline-${TIMESTAMP}.zip"
echo "Creating full project archive $OUT ..."
# Exclude node cache and .git
zip -r "$OUT" . -x "*/.git/*" "node_modules/.cache/*" "path360-full-offline-*.zip" "path360-offline-*.zip"
echo "Full offline package created: $OUT"
