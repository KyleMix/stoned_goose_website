// Facebook feed -> content/feeds/facebook.json
// Uses Facebook Graph API (page-level token).
//
// Required env:
//   FACEBOOK_PAGE_ACCESS_TOKEN
// Reads page ID from content/site.ts site.social.facebookPageId.
import { site } from "../../content/site";
import type { FacebookFeed, FacebookPost } from "../../content/feeds/types";
import { logFailure, writeFeed } from "./_helpers";
import { FacebookFeedSchema, parseOrThrow } from "./schema";

const SOURCE = "facebook" as const;
const LIMIT = 12;
const API_VERSION = "v19.0";

type GraphPost = {
  id: string;
  message?: string;
  created_time: string;
  permalink_url: string;
  full_picture?: string;
};

type GraphResponse = { data: GraphPost[] };

function normalize(item: GraphPost): FacebookPost {
  return {
    id: item.id,
    permalink: item.permalink_url,
    message: item.message ?? null,
    createdAt: item.created_time,
    attachmentImageUrl: item.full_picture ?? null,
  };
}

async function main() {
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const pageId = site.social.facebookPageId;

  if (!token) {
    console.log(
      "[feeds:facebook] skipping. missing FACEBOOK_PAGE_ACCESS_TOKEN.",
    );
    return;
  }
  if (!pageId) {
    console.log(
      "[feeds:facebook] skipping. site.social.facebookPageId is empty.",
    );
    return;
  }

  const params = new URLSearchParams({
    fields: "id,message,created_time,permalink_url,full_picture",
    limit: String(LIMIT),
    access_token: token,
  });
  const url = `https://graph.facebook.com/${API_VERSION}/${pageId}/posts?${params.toString()}`;

  let res: Response;
  try {
    res = await fetch(url);
  } catch (err) {
    logFailure(SOURCE, `network error: ${err instanceof Error ? err.message : String(err)}`);
    return;
  }
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    logFailure(SOURCE, `${res.status} ${res.statusText} ${body.slice(0, 240)}`);
    return;
  }

  let data: GraphResponse;
  try {
    data = (await res.json()) as GraphResponse;
  } catch (err) {
    logFailure(SOURCE, `bad JSON: ${err instanceof Error ? err.message : String(err)}`);
    return;
  }

  const posts: FacebookPost[] = (data.data ?? []).slice(0, LIMIT).map(normalize);

  const feed: FacebookFeed = {
    fetchedAt: new Date().toISOString(),
    source: SOURCE,
    status: "ok",
    errorMessage: null,
    posts,
  };
  parseOrThrow(FacebookFeedSchema, feed, "facebook fetch output");
  writeFeed(SOURCE, feed);
  console.log(`[feeds:facebook] wrote ${posts.length} posts`);
}

main();
