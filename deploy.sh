#!/bin/bash
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "Building Campeonato Canguru..."
npm run build

echo "Deploying to /root/campeonato-canguru/dist/..."
rsync -a dist/ /root/campeonato-canguru/dist/

# Keep icons and manifest
cp /root/campeonato-canguru/dist/icon-*.png /root/campeonato-canguru/dist/ 2>/dev/null || true

systemctl restart campeonato-canguru
echo "Done → https://campeonatocanguru.duckdns.org"
