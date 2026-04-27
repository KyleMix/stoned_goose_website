// Facebook Page posts -> content/.generated/facebook.json
// Page-level token (~60-day expiry, refreshed via the Meta app).
import { join } from "node:path";
import type { FacebookPost } from "../content/social";
import { requireEnv, safeFetch, writeJson } from "./_sync-helpers";

const OUT_PATH = join(process.cwd(), "content", ".generated", "facebook.json");

type GraphPost = {
  id: string;
  message?: string;
  permalink_url: string;
  created_time: string;
  full_picture?: string;
};

type GraphResponse = { data: GraphPost[] };

async function main() {
  const env = requireEnv("FACEBOOK_PAGE_ACCESS_TOKEN", "FACEBOOK_PAGE_ID");
  if (!env) return;

  const limit = Math.min(
    Math.max(parseInt(process.env.FACEBOOK_POSTS_LIMIT ?? "5", 10), 1),
    25,
  );

  const params = new URLSearchParams({
    fields: "id,message,permalink_url,created_time,full_picture",
    limit: String(limit),
    access_token: env.FACEBOOK_PAGE_ACCESS_TOKEN,
  });
  const url = `https://graph.facebook.com/v21.0/${env.FACEBOOK_PAGE_ID}/posts?${params.toString()}`;

  const data = (await safeFetch(url)) as GraphResponse | null;
  if (!data) {
    console.log("[sync:facebook] request failed. keeping existing JSON.");
    return;
  }

  const posts: FacebookPost[] = data.data
    .filter((p) => p.message)
    .map((p) => ({
      id: p.id,
      message: p.message ?? "",
      permalink: p.permalink_url,
      createdAt: p.created_time,
      fullPicture: p.full_picture ?? null,
    }));

  writeJson(OUT_PATH, posts);
  console.log(`[sync:facebook] wrote ${posts.length} posts`);
}

main();
