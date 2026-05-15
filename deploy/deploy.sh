#!/usr/bin/env bash
# Server deploy helper. Builds the static export locally, rsyncs to a
# remote host, and atomically swaps the symlink that nginx serves from.
#
# Usage:
#   DEPLOY_HOST=user@example.com ./deploy/deploy.sh
#
# Optional env:
#   DEPLOY_PATH    target dir on the server (default: /var/www/stoned-goose)
#   KEEP_RELEASES  how many old releases to keep (default: 5)
#
# The server side expects:
#   $DEPLOY_PATH/releases/   per-deploy dirs (timestamped)
#   $DEPLOY_PATH/current     symlink -> the active release
#
# nginx should serve $DEPLOY_PATH/current as its document root. See
# deploy/systemd/stoned-goose-nginx.conf.

set -euo pipefail

: "${DEPLOY_HOST:?DEPLOY_HOST must be set (user@host)}"
DEPLOY_PATH="${DEPLOY_PATH:-/var/www/stoned-goose}"
KEEP_RELEASES="${KEEP_RELEASES:-5}"
RELEASE="$(date -u +%Y%m%d%H%M%S)"
REMOTE_RELEASE="$DEPLOY_PATH/releases/$RELEASE"

cd "$(dirname "$0")/.."

echo ">> Building static export locally"
npm ci --no-audit --no-fund
npm run build

if [[ ! -d out ]]; then
  echo "!! /out does not exist after build. Aborting." >&2
  exit 1
fi

echo ">> Shipping to $DEPLOY_HOST:$REMOTE_RELEASE"
ssh "$DEPLOY_HOST" "mkdir -p '$DEPLOY_PATH/releases'"
rsync -az --delete --info=stats1 ./out/ "$DEPLOY_HOST:$REMOTE_RELEASE/"

echo ">> Swapping current -> $RELEASE"
ssh "$DEPLOY_HOST" bash -s <<EOF
  set -euo pipefail
  cd '$DEPLOY_PATH'
  ln -sfn 'releases/$RELEASE' current.new
  mv -Tf current.new current
  # Prune old releases, newest first.
  cd releases
  ls -1t | tail -n +$((KEEP_RELEASES + 1)) | xargs -r rm -rf
EOF

echo ">> Done. Active release: $RELEASE"
echo "   Run \`sudo systemctl reload nginx\` on the server if cache headers changed."
