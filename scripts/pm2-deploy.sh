#!/usr/bin/env bash
# PM2 bilan production ishga tushirish (Docker kerak emas)
set -euo pipefail

cd "$(dirname "$0")/.."

mkdir -p logs uploads

if [ ! -f .env ]; then
  echo "ERROR: .env fayl topilmadi. cp .env.example .env && nano .env"
  exit 1
fi

echo "==> npm install"
npm ci

echo "==> Prisma generate + build"
npm run build

echo "==> Database schema"
npm run db:push

if [ "${SKIP_SEED:-0}" != "1" ]; then
  echo "==> Seed demo data"
  npm run db:seed || true
fi

echo "==> PM2 start/reload"
if pm2 describe nexus-app >/dev/null 2>&1; then
  pm2 reload ecosystem.config.cjs --update-env
else
  pm2 start ecosystem.config.cjs
fi

pm2 save

echo ""
echo "OK — http://localhost:3000"
echo "Logs: pm2 logs"
echo "Status: pm2 status"
