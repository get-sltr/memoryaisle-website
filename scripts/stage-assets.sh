#!/usr/bin/env bash
# Stage only public site files for Wrangler (avoids scanning .git / iCloud metadata)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STAGE="$ROOT/.wrangler-assets"

rm -rf "$STAGE"
mkdir -p "$STAGE"

rsync -a \
  --exclude='.git/' \
  --exclude='.wrangler-assets/' \
  --exclude='.cursor/' \
  --exclude='.claude/' \
  --exclude='node_modules/' \
  --exclude='.DS_Store' \
  --exclude='*.log' \
  --exclude='wrangler.toml' \
  --exclude='worker.js' \
  --exclude='.assetsignore' \
  --exclude='.gitignore' \
  --exclude='CLAUDE.md' \
  --exclude='vercel.json' \
  --exclude='deploy.sh' \
  --exclude='scripts/' \
  "$ROOT/" "$STAGE/"

COUNT="$(find "$STAGE" -type f | wc -l | tr -d ' ')"
echo "Staged $COUNT files → .wrangler-assets/"
