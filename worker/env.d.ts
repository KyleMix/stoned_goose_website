// The slice of the Workers runtime the sign up Worker actually touches.
//
// Hand written rather than pulled from @cloudflare/workers-types, because that
// package replaces the DOM lib globally and this repo is a browser app that
// happens to ship one Worker file. Installing it makes `fetch`, `Response` and
// `crypto` resolve to Workers shapes inside components/ too, which is a large
// change to the app's type environment in exchange for four interfaces.
//
// Keep this to what worker/index.ts uses. If the Worker grows past a handful
// of bindings, that is the moment to ask about the real types package and a
// separate tsconfig for worker/, not the moment to guess at more shapes here.

/** https://developers.cloudflare.com/d1/worker-api/ */
interface D1Result<T = Record<string, unknown>> {
  results: T[];
  success: boolean;
  meta: { changes: number; duration: number };
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run(): Promise<D1Result>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<D1Result[]>;
  exec(query: string): Promise<{ count: number; duration: number }>;
}

/** The static assets binding declared in wrangler.jsonc. */
interface Fetcher {
  fetch(request: Request): Promise<Response>;
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

interface ScheduledController {
  scheduledTime: number;
  cron: string;
}
