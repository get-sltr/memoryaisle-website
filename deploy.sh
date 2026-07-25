#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
./scripts/stage-assets.sh
# Bump Node heap so wrangler's asset-list build doesn't OOM on large/iCloud trees
NODE_OPTIONS="--max-old-space-size=8192" npx wrangler deploy "$@"
