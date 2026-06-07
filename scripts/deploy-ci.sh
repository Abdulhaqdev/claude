#!/usr/bin/env bash
# GitHub Actions deploy — seed qilmaydi, faqat build + migrate + restart
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "ERROR: .env topilmadi"
  exit 1
fi

export DOCKER_BUILDKIT=1
export COMPOSE_BAKE=false

echo "==> Pull latest code already done by CI"

echo "==> Build app"
docker compose build app

echo "==> Build worker"
docker compose build worker

echo "==> DB migrate (no seed)"
docker compose --profile setup run --rm db-migrate

echo "==> Restart services"
docker compose up -d

echo "==> Health check"
sleep 5
curl -sf http://localhost/api/health || curl -sf http://127.0.0.1:3000/api/health || true

docker compose ps
echo "Deploy OK"
