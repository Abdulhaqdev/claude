#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
DOMAIN="${DOMAIN:-srm.boostify.uz}"
EMAIL="${SSL_EMAIL:-admin@boostify.uz}"

apt-get update -qq
apt-get install -y certbot

mkdir -p nginx/ssl

echo "==> Stop nginx for certbot standalone"
docker compose stop nginx

certbot certonly --standalone \
  -d "${DOMAIN}" \
  --non-interactive \
  --agree-tos \
  -m "${EMAIL}"

cp "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" nginx/ssl/
cp "/etc/letsencrypt/live/${DOMAIN}/privkey.pem" nginx/ssl/

cp nginx/nginx.production.conf nginx/nginx.conf

echo "==> Rebuild app with HTTPS URL (NEXT_PUBLIC_APP_URL)"
grep -q 'NEXT_PUBLIC_APP_URL=https' .env || sed -i 's|NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=https://'"${DOMAIN}"'|' .env

export COMPOSE_BAKE=false
docker compose build app
docker compose up -d

echo ""
echo "SSL tayyor: https://${DOMAIN}"
echo "Renew test: certbot renew --dry-run"
