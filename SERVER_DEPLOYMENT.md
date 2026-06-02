# Server deployment

The site is a Next.js 15 static export. `npm run build` writes everything
needed into `/out`: HTML, hashed JS/CSS, images, the Pagefind index, the
sitemap, OG images, and the meta-refresh stubs for old URLs. There is no
Node.js runtime in production. Any web server that can serve a directory
of files will work.

**Recommended: [Cloudflare Pages](#0-cloudflare-pages-recommended).** It is
free for commercial use, rebuilds and publishes automatically on every push
to `main`, natively honors the `public/_redirects` and `public/_headers`
files in this repo, and pairs cleanly with the Sveltia CMS so edits go live
on their own. Choose a self-managed server below only if you specifically
want to host it yourself.

This document walks through Cloudflare Pages first, then the four ways to put
it on your own server, from "fastest" to "most control."

| Option | When to pick it | TLS | Effort |
|---|---|---|---|
| [Cloudflare Pages](#0-cloudflare-pages-recommended) | You want auto-deploy on push and a free, zero-maintenance host | Auto | Lowest |
| [Docker Compose + Caddy](#1-docker-compose--caddy) | Single VPS, you want auto-TLS in one shot | Auto | Low |
| [Docker only](#2-docker-only-behind-an-existing-proxy) | Already have nginx/Cloudflare in front | Front it | Low |
| [Host nginx + rsync](#3-host-nginx--rsync-no-docker) | Bare-metal or shared host with nginx | certbot | Medium |
| [Any other static host](#4-any-other-static-host) | S3, GCS, Azure Blob, Apache, Caddy without Docker, etc. | Varies | Varies |

All serve the same `/out` directory. Pick one.

---

## 0. Cloudflare Pages (recommended)

Connect the GitHub repo once and Cloudflare rebuilds and publishes on every
push. The Sveltia CMS commits edits to `main`, so saving in the editor
publishes the site automatically a minute or two later. No zip, no server.

### Create the project

1. In the Cloudflare dashboard: **Workers & Pages -> Create -> Pages ->
   Connect to Git**. Pick `KyleMix/stoned_goose_website`, branch `main`.
2. Build settings:
   - **Framework preset:** None (this is a plain static export).
   - **Build command:** `npm run build`
   - **Build output directory:** `out`
   - **Environment variables:** `NODE_VERSION = 20`. The feed/sync scripts in
     `prebuild` tolerate missing API tokens and fall back to the committed
     JSON, so no secrets are required for a first deploy. Add the optional
     `NEXT_PUBLIC_*` analytics vars from [`.env.example`](./.env.example) if
     you want them.
3. Deploy. You get a `*.pages.dev` URL. Add your custom domain under the
   project's **Custom domains** tab and point DNS as Cloudflare instructs.

Cloudflare Pages applies `public/_redirects` (legacy slug redirects) and
`public/_headers` (OG image MIME) automatically, so the redirects and social
cards behave the same as everywhere else.

### Publish workflow

Push to `main` (directly, or via a CMS save) and Cloudflare rebuilds. That is
the whole loop. To edit content in a browser, set up the CMS below.

---

## Prerequisites (all options)

- **Node 20+** to build (`engines.node >= 20`).
- The repo cloned on a build machine. The build does NOT need to happen
  on the production server. Build anywhere with Node 20+, ship the `/out`
  directory or the Docker image to the server.
- **Optional build-time env**: see [`.env.example`](./.env.example). All
  feed and sync scripts tolerate missing env vars, so a no-secret build
  still succeeds. The previous JSON in `content/feeds/` stays in place.
- **Production env** that ends up in the bundle:
  - `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` (optional, enables analytics)
  - `NEXT_PUBLIC_GSC_VERIFICATION` (optional)
  - `NEXT_PUBLIC_BING_VERIFICATION` (optional)

`NEXT_PUBLIC_*` values are baked in at build time, so they must be set
before `npm run build` runs. The `/admin` editor needs no build-time env var;
its auth is configured at runtime in `public/admin/config.yml` (see
[Editing with Sveltia CMS](#editing-with-sveltia-cms)).

---

## 1. Docker Compose + Caddy

One command on a clean Ubuntu/Debian VPS gets you HTTPS, redirects, and a
restart-on-crash setup. Caddy issues a Let's Encrypt cert on first start
and renews it on its own.

### Server setup (once)

```bash
# Install Docker + Compose (Ubuntu/Debian).
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker "$USER"
newgrp docker

# Open the firewall.
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

Point an `A` (and ideally `AAAA`) DNS record for your domain at the
server. Wait until `dig +short YOUR_DOMAIN` returns the right IP before
running Caddy, or the TLS cert request will fail.

### Deploy

```bash
git clone https://github.com/KyleMix/stoned_goose_website.git
cd stoned_goose_website

# Edit the domain in deploy/caddy/Caddyfile.
$EDITOR deploy/caddy/Caddyfile

# Set build-time NEXT_PUBLIC_* values (optional).
cp .env.example .env
$EDITOR .env

# Build and start the site + Caddy.
docker compose --profile prod up -d --build
```

Visit `https://YOUR_DOMAIN`. Caddy logs (`docker compose logs caddy`)
will show the cert handshake on first start.

### Update

```bash
git pull
docker compose --profile prod up -d --build
```

The build is deterministic; Compose only restarts containers whose image
changed.

---

## 2. Docker only (behind an existing proxy)

If you already terminate TLS with nginx, Cloudflare, Caddy, or a managed
LB, run just the site container and point your proxy at it.

```bash
docker compose up -d --build site
# nginx listens on http://127.0.0.1:8080
```

Or without Compose:

```bash
docker build -t stoned-goose-site:latest .
docker run -d \
  --name stoned-goose-site \
  --restart unless-stopped \
  -p 127.0.0.1:8080:80 \
  stoned-goose-site:latest
```

Then proxy `https://YOUR_DOMAIN` to `127.0.0.1:8080`. The container's
nginx already sets cache headers, MIME for OG images, and the legacy slug
redirects, so the outer proxy can stay a thin pass-through.

For systemd-managed Docker (no Compose), see
[`deploy/systemd/stoned-goose-site.service`](./deploy/systemd/stoned-goose-site.service).

### Build-time secrets

Build args are how `NEXT_PUBLIC_*` values get into the bundle:

```bash
docker build \
  --build-arg NEXT_PUBLIC_PLAUSIBLE_DOMAIN=stonedgooseproductions.com \
  -t stoned-goose-site:latest .
```

For feed/sync secrets (`INSTAGRAM_ACCESS_TOKEN`, `FOURTHWALL_API_*`, etc.)
prefer BuildKit secrets so they never end up in image layers:

```bash
DOCKER_BUILDKIT=1 docker build \
  --secret id=env,src=.env.production \
  -t stoned-goose-site:latest .
```

Then in the Dockerfile, mount it for the build step:

```dockerfile
RUN --mount=type=secret,id=env,target=/app/.env npm run build
```

(Not enabled by default. The current Dockerfile builds with no secrets
mounted; feeds fall back to the committed JSON.)

---

## 3. Host nginx + rsync (no Docker)

Best when the box already runs nginx for other vhosts and you'd rather
not introduce Docker. Build locally, rsync `/out` to the server,
flip a symlink.

### Server setup (once)

```bash
sudo apt update
sudo apt install -y nginx rsync
sudo mkdir -p /var/www/stoned-goose/releases
sudo chown -R "$USER":www-data /var/www/stoned-goose
sudo cp deploy/systemd/stoned-goose-nginx.conf /etc/nginx/sites-available/stoned-goose
sudo ln -s /etc/nginx/sites-available/stoned-goose /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# TLS via Let's Encrypt.
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d stonedgooseproductions.com -d www.stonedgooseproductions.com
```

### Deploy from your laptop

```bash
DEPLOY_HOST=user@your-server ./deploy/deploy.sh
```

The script builds locally, rsyncs into a timestamped release dir, and
atomically swaps `/var/www/stoned-goose/current` to point at the new
release. Old releases (default: keep 5) are pruned automatically.

To roll back:

```bash
ssh user@your-server '
  cd /var/www/stoned-goose
  ln -sfn "releases/$(ls -1t releases | sed -n 2p)" current.new
  mv -Tf current.new current
'
```

---

## 4. Any other static host

Because the output is plain files, anything that serves a directory
works:

- **Apache**: point `DocumentRoot` at `/out`. Replicate the redirects
  from [`public/_redirects`](./public/_redirects) into `.htaccess`.
- **AWS S3 + CloudFront**: `aws s3 sync out/ s3://your-bucket --delete`
  then invalidate `/*`. Use CloudFront Functions for the legacy
  redirects.
- **Azure Static Web Apps / GCS**: upload `/out`. Use the provider's
  redirect config to mirror `_redirects`.
- **Plain Caddy on the host** (no Docker): point a file_server block at
  `/var/www/stoned-goose/current` and import the redirect rules from
  [`deploy/caddy/Caddyfile`](./deploy/caddy/Caddyfile). Note that Caddy
  needs explicit rules for the 308 legacy redirects (the bundled
  Caddyfile proxies to nginx, which handles those).

What you have to replicate on every host:

1. **Pretty URLs**: serve `foo/index.html` for requests to `/foo`. Next's
   static export already generates the right directory structure; most
   web servers do this with `try_files $uri $uri/ $uri.html`.
2. **Legacy redirects**: `/about → /roster`, `/media → /watch`,
   `/services → /book`, etc. The canonical list lives in
   [`public/_redirects`](./public/_redirects) and is duplicated in
   [`vercel.json`](./vercel.json) and the nginx configs under
   [`deploy/`](./deploy/).
3. **OG image MIME**: `/<route>/opengraph-image` ships without a `.png`
   extension; force `Content-Type: image/png`. See
   [`public/_headers`](./public/_headers).
4. **Cache headers**: long-cache `/_next/static/*` (content-hashed) and
   media; short-cache HTML.

---

## What `npm run build` actually does

```text
prebuild  ->  feeds:all (best-effort, tolerates missing tokens)
              feeds:validate
              sync (best-effort)
              content:index
              build:placeholders
build     ->  next build           # writes /out
postbuild ->  build-shows-feeds.ts # writes /out/feeds/*
              pagefind             # writes /out/pagefind/*
```

If you don't want the prebuild syncs to run on the production build
machine (because tokens live elsewhere, or the box has no outbound
network), they all no-op gracefully on missing env. The previous
`content/feeds/*.json` checked into git stays in place.

To skip them entirely, run `next build` directly instead of `npm run
build` -- but then you also miss `content:index` and
`build:placeholders`, which the components need. The cleanest "build
without external calls" recipe is:

```bash
npm run content:index
npm run build:placeholders
npx next build
npx tsx scripts/build-shows-feeds.ts
npx pagefind --site out --output-path out/pagefind
```

---

## Smoke test after deploy

Run from any machine that can reach the server:

```bash
DOMAIN=stonedgooseproductions.com
for path in / /shows /book /watch /roster /sitemap.xml; do
  printf '%-20s ' "$path"
  curl -sI "https://$DOMAIN$path" | head -n 1
done
# Verify old-slug redirects.
for path in /about /media /services /sponsorships; do
  printf '%-20s ' "$path"
  curl -sI "https://$DOMAIN$path" | awk '/^HTTP|^[Ll]ocation/ {print}' | tr '\n' ' '
  echo
done
# Verify OG image MIME.
curl -sI "https://$DOMAIN/opengraph-image" | grep -i content-type
```

Expected: `200` for the first set, `308` with a `Location:` header for
the legacy slugs, and `image/png` on the OG endpoint.

---

## Editing with Sveltia CMS

The editor lives at `/admin`. It is [Sveltia CMS](https://github.com/sveltia/sveltia-cms),
a static, git-based visual editor: `public/admin/index.html` loads it from a
CDN and `public/admin/config.yml` describes the content. There is no backend
server. Saves are committed straight to GitHub on `main`, and the host (any
of the options above) rebuilds and publishes. On Cloudflare Pages the change
is live in a minute or two with no further action.

Because the site is a static export, GitHub login needs a tiny OAuth relay.
This is a one-time setup.

### 1. Register a GitHub OAuth App

GitHub -> **Settings -> Developer settings -> OAuth Apps -> New OAuth App**:

- **Application name:** Stoned Goose CMS (anything).
- **Homepage URL:** `https://www.stonedgooseproductions.com`
- **Authorization callback URL:** `https://<your-worker-subdomain>.workers.dev/callback`
  (you set this Worker up in step 2; come back and paste the real URL).

Note the **Client ID** and generate a **Client secret**.

### 2. Deploy the auth Worker

Sveltia provides a ready-made Cloudflare Worker for the OAuth handshake:
[`sveltia/sveltia-cms-auth`](https://github.com/sveltia/sveltia-cms-auth).
Deploy it to your Cloudflare account (one click from its README, or
`wrangler deploy`). Set these Worker secrets/variables:

- `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` from step 1.
- `ALLOWED_DOMAINS` = `www.stonedgooseproductions.com` (and `*.pages.dev` if
  you want to use the preview URL).

Copy the deployed Worker URL (e.g. `https://sveltia-cms-auth.<you>.workers.dev`)
and finish the OAuth App callback URL in step 1 as `<that URL>/callback`.

### 3. Point the CMS at the Worker

In [`public/admin/config.yml`](./public/admin/config.yml), set:

```yaml
backend:
  name: github
  repo: KyleMix/stoned_goose_website
  branch: main
  base_url: https://sveltia-cms-auth.<you>.workers.dev
```

Commit and deploy. Visit `/admin`, click "Sign in with GitHub", and edit.
Make a trivial change, save, and confirm the commit lands on `main` and the
site redeploys.

The config maps every editable area to the JSON under `content/`. Notes:

- **Singletons** (site config, page copy) live under "Site copy".
- **Collections** (Comedians, Crew members, Shows, Open mics, Services,
  Pricing tiers, Shop products, Pages, TikTok videos) each manage one entry
  per file.
- **News** posts are not yet wired into the CMS (markdoc format); add them
  via GitHub for now.
- The **no em dashes** house rule is enforced with a pattern validator on
  long-form fields.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `npm run build` fails on `sharp` / `plaiceholder` | Glibc too old on the build machine | Use Node 20 from the official image, not Alpine on older hosts. The Dockerfile uses `node:20-bookworm-slim`. |
| `/admin` loads but login fails | `backend.base_url` in `public/admin/config.yml` is wrong, or the GitHub OAuth callback URL does not match the Worker | Re-check the Worker URL and the OAuth App callback (`<worker>/callback`); confirm `ALLOWED_DOMAINS` includes your domain. |
| CMS save fails with a permissions error | The signed-in GitHub user lacks write access to the repo | Sign in with an account that can push to `KyleMix/stoned_goose_website`. |
| Old URLs hit 404 instead of redirecting | Web server not consulting `_redirects` / `_headers` | Use one of the bundled nginx / Caddy configs, or replicate the rules. The meta-refresh stubs in `public/<slug>/index.html` still bounce users; only the `Location` header is missing. |
| OG cards render as broken images on Slack/Discord | `Content-Type` is `application/octet-stream` for `/opengraph-image` | Force `image/png` on `/*/opengraph-image` (see the configs). |
| Caddy can't get a cert | DNS not propagated yet, or ports 80/443 not reachable | `dig +short YOUR_DOMAIN`, then `sudo ss -lntp | grep ':80\|:443'`. |
| Feeds out of date after deploy | Build-time fetch failed and cached JSON shipped | Manual: `INSTAGRAM_ACCESS_TOKEN=xxx npm run feeds:instagram && npm run build`. Long-term: schedule rebuilds (see `.github/workflows/refresh-feeds.yml`). |

---

## File map

```
Dockerfile                              # Multi-stage build -> nginx:alpine
docker-compose.yml                      # site + optional caddy reverse proxy
.dockerignore                           # keeps node_modules / .git out of image
deploy/
  deploy.sh                             # local build + rsync + symlink swap
  nginx/site.conf                       # nginx vhost INSIDE the image
  caddy/Caddyfile                       # TLS proxy in front of the image
  systemd/stoned-goose-site.service     # systemd unit for Docker-without-Compose
  systemd/stoned-goose-nginx.conf       # host-level nginx vhost for rsync deploys
SERVER_DEPLOYMENT.md                    # this file
```

The legacy hosted-platform configs (`vercel.json`, `public/_redirects`,
`public/_headers`) are untouched. Vercel, Cloudflare Pages, and Netlify
still deploy the same way they did before.
