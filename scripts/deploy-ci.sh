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

echo "==> SSL nginx config (sertifikat mavjud bo'lsa)"
if [ -f nginx/ssl/fullchain.pem ] && [ -f nginx/ssl/privkey.pem ]; then
  cp nginx/nginx.production.conf nginx/nginx.conf
  echo "HTTPS nginx.conf restored"
fi

echo "==> Build app"
docker compose build app

echo "==> Build worker"
docker compose build worker

echo "==> DB migrate (no seed)"
docker compose --profile setup run --rm db-migrate

echo "==> Restart services"
docker compose up -d

echo "==> Wait for app"
for i in $(seq 1 30); do
  if docker compose exec -T nginx wget -qO- http://app:3000/api/health >/dev/null 2>&1; then
    echo "App healthy after ${i}s"
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "ERROR: App health check failed"
    docker compose logs app --tail 40
    docker compose ps
    exit 1
  fi
  sleep 2
done

docker compose restart nginx
sleep 2

if curl -sf https://srm.boostify.uz/api/health >/dev/null 2>&1; then
  echo "Public health OK"
elif curl -sfk https://localhost/api/health >/dev/null 2>&1; then
  echo "Local HTTPS health OK"
else
  echo "WARN: Public health check failed — check nginx/ssl and app logs"
  docker compose logs nginx --tail 20
fi

docker compose ps
echo "Deploy OK"
