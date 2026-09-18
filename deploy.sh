#!/bin/bash
set -euo pipefail

# サーバー上で実行する静的LPの公開スクリプト

echo "Deploying static LP..."

cd ~/yaku_navi

echo "Fetching latest code..."
git pull origin main

echo "Publishing files..."
sudo mkdir -p /var/www/yaku-navi
sudo cp index.html styles.css /var/www/yaku-navi/
sudo chown -R www-data:www-data /var/www/yaku-navi

echo "Updating Nginx..."
sudo cp nginx-yaku-navi.conf /etc/nginx/sites-available/yaku-navi
sudo nginx -t
sudo systemctl reload nginx

echo "Stopping old Node apps..."
pm2 stop yaku-navi-backend yaku-navi-frontend || true
pm2 delete yaku-navi-backend yaku-navi-frontend || true
pm2 save || true

echo "Deploy completed."
echo "Check: https://yaku-navi.com"
