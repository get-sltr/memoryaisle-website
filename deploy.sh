#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
./scripts/stage-assets.sh
npx wrangler deploy "$@"
