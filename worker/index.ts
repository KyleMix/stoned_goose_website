// A pass-through Worker that hands every request to the static assets.
//
// It does nothing on purpose. The site is a static export served from /out by
// Workers Static Assets, and wrangler.jsonc only points `main` here so that
// `wrangler deploy` does not auto-detect Next.js and try to wrap the repo with
// OpenNext (there is no server build to wrap). Assets are matched before this
// Worker runs, and unmatched paths get the 404 page, so in practice it never
// sees a request.
//
// This file used to be the open mic sign up API, backed by D1. That list was
// retired in October 2026: comics now message us on Instagram or by email.

interface Env {
  ASSETS: Fetcher;
}

export default {
  fetch(request: Request, env: Env): Promise<Response> {
    return env.ASSETS.fetch(request);
  },
};
