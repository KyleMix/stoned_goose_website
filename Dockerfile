# syntax=docker/dockerfile:1.7
#
# Multi-stage build for stonedgooseproductions.com.
#
# Stage 1 (builder): installs deps and runs `npm run build` to produce the
# static export at /out. Stage 2 (runtime): a tiny nginx image that serves
# /out as the document root. The result is a self-contained image with no
# Node.js runtime, no source, no node_modules.

# ---- Stage 1: build the static export ----
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Install only what npm needs to resolve. Copying package-lock too means
# `npm ci` enforces the locked tree.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Copy the rest of the source. .dockerignore keeps build/runtime junk out.
COPY . .

# Build-time secrets (feeds:*, sync:*) are optional. The prebuild step
# tolerates missing env vars and network failures, so the build still
# succeeds with no .env present. To inject secrets at build time, pass
# `--build-arg` or use Docker BuildKit secrets, e.g.:
#   docker build --secret id=env,src=.env.production .
# Then mount it where the build needs it:
ARG NEXT_PUBLIC_PLAUSIBLE_DOMAIN=
ARG NEXT_PUBLIC_GSC_VERIFICATION=
ARG NEXT_PUBLIC_BING_VERIFICATION=
ENV NEXT_PUBLIC_PLAUSIBLE_DOMAIN=$NEXT_PUBLIC_PLAUSIBLE_DOMAIN \
    NEXT_PUBLIC_GSC_VERIFICATION=$NEXT_PUBLIC_GSC_VERIFICATION \
    NEXT_PUBLIC_BING_VERIFICATION=$NEXT_PUBLIC_BING_VERIFICATION \
    HUSKY=0 \
    CI=1

RUN npm run build

# ---- Stage 2: serve /out with nginx ----
FROM nginx:1.27-alpine AS runtime

# Drop the default site, install ours.
RUN rm -f /etc/nginx/conf.d/default.conf
COPY deploy/nginx/site.conf /etc/nginx/conf.d/site.conf

# Copy the static export. Owned by nginx so the worker can read it.
COPY --from=builder --chown=nginx:nginx /app/out /usr/share/nginx/html

EXPOSE 80

# nginx runs in the foreground via its default CMD; nothing else to do.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1
