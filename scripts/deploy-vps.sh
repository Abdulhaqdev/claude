#!/usr/bin/env bash
# Full Docker deploy for srm.boostify.uz (2GB VPS friendly — sequential build)
set -euo pipefail

cd "$(dirname "$0")/.."
DOMAIN="${DOMAIN:-srm.boostify.uz}"

if [ ! -f .env ]; then
  echo "ERROR: .env topilmadi. cp .env.example .env && nano .env"
  exit 1
fi

# shellcheck disable=SC1091
set -a && source .env && set +a

if [ "${POSTGRES_PASSWORD:-}" = "CHANGE_ME_strong_db_password" ] || [ "${JWT_SECRET:-}" = "CHANGE_ME_min_32_random_characters_secret" ]; then
  echo "ERROR: .env da POSTGRES_PASSWORD va JWT_SECRET ni o'zgartiring!"
  exit 1
fi

echo "==> Disk & memory"
df -h /
free -h

SWAP_TOTAL=$(free -m | awk '/Swap:/ {print $2}')
if [ "${SWAP_TOTAL:-0}" -lt 512 ]; then
  echo "==> Adding 4GB swap (recommended on 2GB VPS)"
  if [ ! -f /swapfile ]; then
    fallocate -l 4G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
  fi
fi

mkdir -p nginx/ssl logs uploads

export DOCKER_BUILDKIT=1
export COMPOSE_BAKE=false

echo "==> Pull images"
docker compose pull postgres redis nginx 2>/dev/null || true

echo "==> Start database & cache"
docker compose up -d postgres redis
echo "Waiting for postgres..."
sleep 8

echo "==> Build app (1/2)"
docker compose build app

echo "==> Build worker (2/2)"
docker compose build worker

echo "==> Database schema + seed"
docker compose --profile setup run --rm db-setup

echo "==> Start all services"
docker compose up -d

echo "==> Status"
docker compose ps

echo ""
echo "============================================"
echo " Deploy tugadi!"
echo " Site:  http://${DOMAIN}"
echo " Health: curl -s http://${DOMAIN}/api/health"
echo " Login: admin@demo.com / Password123!"
echo ""
echo " SSL uchun: ./scripts/setup-ssl.sh"
echo "============================================"
