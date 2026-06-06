#!/usr/bin/env bash
# Low-RAM VPS deploy: sequential Docker builds to avoid OOM ("signal: killed").
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Memory check"
free -h

SWAP_TOTAL=$(free -m | awk '/Swap:/ {print $2}')
if [ "${SWAP_TOTAL:-0}" -lt 512 ]; then
  echo ""
  echo "WARNING: Swap is low or missing. npm ci often needs 2–4GB RAM."
  echo "Add swap once (recommended on 2GB VPS):"
  echo "  fallocate -l 4G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile"
  echo "  echo '/swapfile none swap sw 0 0' >> /etc/fstab"
  echo ""
fi

export DOCKER_BUILDKIT=1
export COMPOSE_BAKE=false

echo "==> Pull base images"
docker compose pull postgres redis nginx 2>/dev/null || true

echo "==> Build app (step 1/2 — do not run app+worker in parallel on small VPS)"
docker compose build app

echo "==> Build worker (step 2/2)"
docker compose build worker

echo "==> Start stack"
docker compose up -d

echo "==> Status"
docker compose ps

echo ""
echo "Done. If first deploy, run DB setup:"
echo "  export DATABASE_URL='postgresql://nexus:nexus_secret@localhost:5433/nexus_db?schema=public'"
echo "  npm ci && npm run db:push && npm run db:seed"
echo ""
echo "Health: curl -s http://localhost/api/health || curl -s http://localhost:3000/api/health"
