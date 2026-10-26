// The slice of the Workers runtime worker/index.ts touches.
//
// Hand written rather than pulled from @cloudflare/workers-types, because that
// package replaces the DOM lib globally and this repo is a browser app that
// happens to ship one Worker file.

/** The static assets binding declared in wrangler.jsonc. */
interface Fetcher {
  fetch(request: Request): Promise<Response>;
}
