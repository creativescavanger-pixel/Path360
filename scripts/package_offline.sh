#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT_DIR"

echo "Installing dependencies (prefer cached)..."
if [ -f package-lock.json ]; then
  npm ci --prefer-offline --no-audit --progress=false || npm install
else
  npm install --prefer-offline --no-audit --progress=false || npm install
fi

echo "Building production bundle..."
npm run build

TIMESTAMP=$(date +%Y%m%d%H%M%S)
OUT="path360-offline-${TIMESTAMP}.zip"
echo "Creating archive $OUT ..."
zip -r "$OUT" dist package.json package-lock.json README.md vite.config.js Dockerfile scripts || true
echo "Offline package created: $OUT"

echo "Tip: Transfer this zip to another computer, unzip, and serve the 'dist/' folder with a static server."
