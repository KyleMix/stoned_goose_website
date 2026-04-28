# Social feeds — setup and rotation

Build-time pulls of Instagram, YouTube, and Facebook content. Static
export means the browser cannot hit those APIs directly, so a scheduled
GitHub Action runs the fetch scripts every 6 hours, normalizes results
into typed JSON under `content/feeds/`, and commits the change. The
host's auto-deploy hook ships the new build.

## Architecture at a glance

```
GitHub cron (every 6h)
        │
        ▼
.github/workflows/refresh-feeds.yml
        │
        ▼
npm run feeds:instagram  ─►  content/feeds/instagram.json
npm run feeds:youtube    ─►  content/feeds/youtube.json
npm run feeds:facebook   ─►  content/feeds/facebook.json
        │
        ▼
git commit "chore(feeds): refresh social content [skip ci]"
        │
        ▼
host auto-deploy → static export ships the new feeds
```

Each fetch script:

- Skips silently when its required env var is unset (build-safe).
- Leaves the existing JSON untouched on API failure, appends a sibling
  `<source>.error.log` (gitignored) so the workflow surfaces the cause.
- Validates output through Zod at site build time via `lib/feeds.ts`.
  Malformed JSON fails the build with a clear field-path error.

## What lives where

| What | Where | Owner-editable? |
|---|---|---|
| Instagram access token | GitHub Actions secret `INSTAGRAM_ACCESS_TOKEN` | Owner |
| YouTube API key | GitHub Actions secret `YOUTUBE_API_KEY` | Owner |
| Facebook page access token | GitHub Actions secret `FACEBOOK_PAGE_ACCESS_TOKEN` | Owner |
| YouTube channel ID | `content/site.ts` `site.social.youtubeChannelId` | Owner (commit) |
| Facebook page ID | `content/site.ts` `site.social.facebookPageId` | Owner (commit) |
| Cached posts/videos | `content/feeds/*.json` | Cron writes; manual edit not recommended |

Tokens never go in `.env`, never in `NEXT_PUBLIC_*`, never in the repo.
Channel and page IDs are public values, safe to commit.

## Configure the cron

Add the three secrets in GitHub repo settings:

```
Settings → Secrets and variables → Actions → New repository secret
  INSTAGRAM_ACCESS_TOKEN
  YOUTUBE_API_KEY
  FACEBOOK_PAGE_ACCESS_TOKEN
```

The workflow runs every 6 hours. To trigger by hand:

```
Actions → Refresh social feeds → Run workflow
```

Or run any feed locally with the secret in your shell:

```bash
INSTAGRAM_ACCESS_TOKEN=xxx npm run feeds:instagram
YOUTUBE_API_KEY=yyy        npm run feeds:youtube
FACEBOOK_PAGE_ACCESS_TOKEN=zzz npm run feeds:facebook
npm run feeds:all   # all three in sequence
```

## Token setup, per platform

### Instagram

Uses the Instagram Graph API at `graph.instagram.com/me/media` (the
Business/Creator endpoint, not the deprecated Basic Display API). Single
long-lived user token, ~60 day expiry.

1. Create a Meta for Developers app at https://developers.facebook.com/.
2. Add the Instagram product to the app, choose "Business Login".
3. Connect the `@stonedgooseproductions` account as a tester or via a
   linked Facebook page.
4. Generate a short-lived token via Graph API Explorer.
5. Exchange for a long-lived token:
   ```
   GET https://graph.instagram.com/access_token
     ?grant_type=ig_exchange_token
     &client_secret={app-secret}
     &access_token={short-lived-token}
   ```
6. Store the long-lived token as `INSTAGRAM_ACCESS_TOKEN` in GitHub
   Actions secrets. Also store it locally as `INSTAGRAM_ACCESS_TOKEN`
   if you want to run `npm run refresh:instagram-token` against it.

Refresh before it expires. Tokens can be refreshed any time after the
first 24 hours for another 60 days:

```bash
INSTAGRAM_ACCESS_TOKEN=<current> npm run refresh:instagram-token
gh secret set INSTAGRAM_ACCESS_TOKEN --body '<new token>'
```

### YouTube

Uses YouTube Data API v3. API keys are long-lived and quota-restricted
(10,000 units/day default; one search.list + one videos.list run
~110 units, well under the cap).

1. Open Google Cloud Console at https://console.cloud.google.com/.
2. Create or pick a project.
3. APIs & Services → Library → enable "YouTube Data API v3".
4. APIs & Services → Credentials → Create credentials → API key.
5. Click the key → Restrict key → API restrictions → "YouTube Data
   API v3" only. Save.
6. Store the value as `YOUTUBE_API_KEY` in GitHub Actions secrets.

Find the channel ID:

1. Visit https://www.youtube.com/@stonedgooseproductions.
2. View page source, search for `"channelId":"`. Copy the `UC...`
   string.
3. Paste into `content/site.ts` at `site.social.youtubeChannelId`.

### Facebook

Uses the Graph API at `graph.facebook.com/v19.0/{page-id}/posts`.
Page-level access token. Default tokens expire in ~60 days; convert to
never-expiring once for set-and-forget rotation.

1. Use the same Meta for Developers app as Instagram.
2. In the app, request Page-level perms (`pages_show_list`,
   `pages_read_engagement`, `pages_read_user_content`).
3. Find the page ID. Visit your Facebook page, click About → Page
   transparency. The Page ID is listed there. Or check the URL of
   `facebook.com/profile.php?id=<id>`.
4. Paste the page ID into `content/site.ts` at
   `site.social.facebookPageId`.
5. Generate a user access token via Graph API Explorer with the perms
   above.
6. Exchange for a long-lived user token:
   ```
   GET https://graph.facebook.com/v19.0/oauth/access_token
     ?grant_type=fb_exchange_token
     &client_id={app-id}
     &client_secret={app-secret}
     &fb_exchange_token={short-lived-token}
   ```
7. Get a never-expiring page access token:
   ```
   GET https://graph.facebook.com/v19.0/me/accounts
     ?access_token={long-lived-user-token}
   ```
   Find the `access_token` field for the right page in the response.
   That token does not expire as long as the user that minted it
   doesn't change their password or revoke the app.
8. Store as `FACEBOOK_PAGE_ACCESS_TOKEN` in GitHub Actions secrets.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Empty feed despite data on platform | Secret missing in Actions, or env var typo | `Settings → Secrets`. Re-run workflow_dispatch. |
| `instagram.error.log` shows 190 / OAuth | Token expired | Refresh per Instagram block above. |
| `facebook.error.log` shows 190 / OAuth | Page token expired | Re-run the long-lived → page token exchange. |
| `youtube.error.log` shows 403 / quotaExceeded | Daily quota hit | Wait 24h, or increase quota in Google Cloud. |
| Workflow runs but no commit | Feed JSON unchanged | Expected. Cron is a no-op when content matches. |
| Build fails with `[feeds] invalid content/feeds/...` | API shape drift, hand-edit gone wrong | Inspect the field path in the error, fix the JSON, rerun the relevant `feeds:*` script. |

## Things this design refuses to do

- No client-side fetch. CORS and tokens both block it.
- No Vercel serverless or edge functions. The site stays portable across
  Vercel / Cloudflare Pages / Netlify.
- No CMS. Feeds are platform truth, mirrored to typed JSON.
- No invented fallback content for empty feeds. Empty stays empty;
  the page falls back to the platform-link CTA.
