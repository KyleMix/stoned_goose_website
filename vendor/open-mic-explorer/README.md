# Open Mic Explorer, mirrored files

Everything in this directory, plus a handful of files under `public/`, is
copied from the Open Mic Explorer app repo. Nothing here is authored in this
repo. Do not edit these files to fix a typo, reword a sentence, or tidy a
placeholder. Fix it over there and re-fetch.

Source repo: https://github.com/KyleMix/Open-Mic-Discovery (public, branch
`main`).

## Why the copies exist

Apple and Google both fetch files from this domain before they will accept the
app. They judge what comes back over HTTP, so these have to be served from
here, not hotlinked from raw.githubusercontent.

The two legal documents are generated over there by `npm run legal:export`, and
each carries an HTML comment banner naming its source. The terms file is
extracted from whichever EULA version the app's migrations publish, because the
agreement lives in the database and the app renders it from that row. If this
site and that row disagree, the site is showing an agreement nobody accepted.
That is the whole reason for the "render it, never rewrite it" rule.

The banner stays in the repo file and is stripped from what visitors see. See
`lib/legal-doc.ts`.

## Refresh

```sh
BASE=https://raw.githubusercontent.com/KyleMix/Open-Mic-Discovery/main

# Legal documents, rendered by app/(site)/open-mics/{privacy,terms}
curl -fsSL "$BASE/web/legal/privacy.md" -o vendor/open-mic-explorer/legal/privacy.md
curl -fsSL "$BASE/web/legal/terms.md"   -o vendor/open-mic-explorer/legal/terms.md

# Account deletion page, served as-is (see the warning below)
curl -fsSL "$BASE/web/delete-account/index.html" \
  -o public/open-mics/delete-account/index.html

# Store association files, served from the domain root
curl -fsSL "$BASE/web/.well-known/apple-app-site-association" \
  -o public/.well-known/apple-app-site-association
curl -fsSL "$BASE/web/.well-known/assetlinks.json" \
  -o public/.well-known/assetlinks.json

# Marketing assets used by the /open-mics announcement page
curl -fsSL "$BASE/marketing/one-sheet/open-mic-explorer.pdf" \
  -o public/open-mic-explorer/open-mic-explorer.pdf
for n in 1 2 3 4 5; do
  curl -fsSL "$BASE/marketing/one-sheet/pages/page-$n.webp" \
    -o "public/open-mic-explorer/one-sheet/page-$n.webp"
done
for s in discover mic-detail going live; do
  curl -fsSL "$BASE/marketing/screenshots/$s.png" \
    -o "public/open-mic-explorer/screenshots/$s.png"
done
```

After a refresh run `npm test`. `scripts/test/legal-docs.test.ts` fails if a
document loses its banner or starts using a markdown construct the renderer
does not handle, which is the signal to extend `lib/legal-doc.ts` rather than
edit the document.

If the marketing assets change, re-read
`marketing/one-sheet/open-mic-explorer.txt` and update `content/open-mic-app.ts`
so the web summary and the sheet do not drift apart.

## Placeholders that are the owner's to fill

Three values in the mirrored files are deliberately left unset. They come from
accounts, and inventing something that looks real would be worse than leaving
them obviously blank.

| What | File | Line |
| --- | --- | --- |
| Supabase function URL | `public/open-mics/delete-account/index.html` | 105, the `data-function-url` attribute on `<body>` |
| Apple Developer Team ID | `public/.well-known/apple-app-site-association` | 6, `TODO_TEAM_ID` |
| Android signing cert fingerprint | `public/.well-known/assetlinks.json` | 7, `TODO_SHA256_CERT_FINGERPRINT` |

Deep links will not verify until the last two are real. That is expected before
the developer accounts exist.

### The deletion page disables its own form, on purpose

`public/open-mics/delete-account/index.html` reads its backend URL from
`data-function-url` on `<body>`. While that value is empty or still the
`YOUR-PROJECT-REF` placeholder, the page disables the form at load and says
why, pointing the visitor at the contact address instead.

That is not an unfinished state to tidy up. It exists so a half-finished
deployment fails visibly, rather than silently accepting someone's email
address for a deletion request that goes nowhere. Google Play tests this page
and a reviewer does try the form, so a silent failure here is a rejection.
Leave the behavior alone.

The file is served straight out of `public/` rather than ported into a Next
route, so that behavior stays byte-for-byte what the app repo ships and a
refresh stays a plain copy.
