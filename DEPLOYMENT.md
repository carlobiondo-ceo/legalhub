# Legal Hub — VPS Deployment Guide

Target: `legal.karmaresponse.com` on Hetzner VPS `46.225.128.220`

## Overview

The stack runs the same as locally (Docker Compose: `db`, `api`, `web`), with **nginx on the host** as a reverse proxy that terminates HTTPS and forwards requests to the containers.

```
Internet → nginx:443 (HTTPS) → web:3000 (Next.js)
                             → api:3001 (Express)
```

## Prerequisites on the VPS

- Docker + Docker Compose installed
- nginx installed
- certbot (for Let's Encrypt SSL)
- Git
- Port 80 and 443 open in firewall

## Step 1 — DNS

Point `legal.karmaresponse.com` to `46.225.128.220` via an **A record** in your DNS provider.

Wait for DNS propagation (`nslookup legal.karmaresponse.com` should return `46.225.128.220`).

## Step 2 — Clone repo on VPS

```bash
ssh root@46.225.128.220
cd /opt
git clone <your-repo-url> legal-hub
cd legal-hub
git checkout dev/phase1-mvp
```

If you don't have the repo on a Git host yet, you can `rsync` the project folder from your local machine:

```bash
rsync -avz --exclude node_modules --exclude .next --exclude uploads \
  C:/Users/Carlo/Projects/Legal/ root@46.225.128.220:/opt/legal-hub/
```

## Step 3 — Create production `.env` on the VPS

```bash
cd /opt/legal-hub
cp .env.production.example .env
nano .env
```

Fill in real values:

- `POSTGRES_PASSWORD` — strong random password
- `DATABASE_URL` — update with the new password
- `SESSION_SECRET` — long random string (`openssl rand -base64 48`)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — from Google Cloud Console
- All URLs pointing to `https://legal.karmaresponse.com`
- `NODE_ENV=production`

## Step 4 — Update Google OAuth

In Google Cloud Console → Credentials → Your OAuth client:

- **Add** authorized redirect URI: `https://legal.karmaresponse.com/api/auth/google/callback`
- Keep the localhost URI too so you can still test locally
- Save

## Step 5 — Start containers

```bash
cd /opt/legal-hub
docker-compose up -d --build
docker-compose exec api npx prisma db push
docker-compose exec api npx prisma db seed
docker-compose logs -f
```

Verify on the VPS itself:

```bash
curl http://localhost:3001/api/health
curl http://localhost:3000
```

## Step 6 — Configure nginx

Create `/etc/nginx/sites-available/legal.karmaresponse.com`:

```nginx
server {
    listen 80;
    server_name legal.karmaresponse.com;

    # ACME challenge for Let's Encrypt
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name legal.karmaresponse.com;

    ssl_certificate     /etc/letsencrypt/live/legal.karmaresponse.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/legal.karmaresponse.com/privkey.pem;

    # Max upload size (documents can be large)
    client_max_body_size 55M;

    # Next.js frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Express API
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable it:

```bash
ln -s /etc/nginx/sites-available/legal.karmaresponse.com /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

## Step 7 — Get SSL certificate

```bash
mkdir -p /var/www/certbot
certbot certonly --webroot -w /var/www/certbot -d legal.karmaresponse.com
systemctl reload nginx
```

Set up auto-renewal:

```bash
certbot renew --dry-run
```

(Certbot typically sets up a systemd timer automatically.)

## Step 8 — Test

Open `https://legal.karmaresponse.com` in a browser. The login page should load over HTTPS.

Sign in with Google using `carlo.biondo@audienceserv.com` — should redirect to the dashboard.

Try signing in with `hue.nguyen@audienceserv.com` and `ninh@audienceserv.com` to verify all three users work.

## Common issues

- **"OAuth client was not found"**: Google OAuth redirect URI doesn't match. Check the Google Cloud Console has `https://legal.karmaresponse.com/api/auth/google/callback`.
- **"Access denied"**: Email signed in doesn't match any seeded user. Check database with `docker-compose exec db psql -U legal -d legal_hub -c 'SELECT email FROM "User";'`.
- **502 Bad Gateway**: Docker containers not running. `docker-compose ps` and `docker-compose logs`.
- **Session cookies not saving**: `trust proxy` not set or `secure: true` with HTTP. Verify nginx is passing `X-Forwarded-Proto` and `NODE_ENV=production` is set.

## Updating the app later

```bash
cd /opt/legal-hub
git pull
docker-compose up -d --build
docker-compose exec api npx prisma db push  # if schema changed
```
