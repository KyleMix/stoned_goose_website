// Swap a near-expiry Instagram long-lived token for a fresh one.
// Usage: INSTAGRAM_ACCESS_TOKEN=<current> npm run refresh:instagram-token
//
// Long-lived IG tokens last ~60 days and can be refreshed for another 60 days
// any time after the first 24 hours. The script prints the new token; rotate
// it into the GitHub Actions secret manually (or via gh secret set).
import { safeFetch } from "./_sync-helpers";

type RefreshResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

async function main() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) {
    console.error("[refresh:instagram-token] missing INSTAGRAM_ACCESS_TOKEN env var");
    process.exit(1);
  }

  const url = `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(token)}`;
  const data = (await safeFetch(url)) as RefreshResponse | null;
  if (!data) {
    console.error("[refresh:instagram-token] refresh request failed");
    process.exit(1);
  }

  const days = Math.round(data.expires_in / 86400);
  console.log("[refresh:instagram-token] new token issued.");
  console.log(`Expires in ~${days} days.`);
  console.log("");
  console.log("Update GitHub secret:");
  console.log("  gh secret set INSTAGRAM_ACCESS_TOKEN --body '<new token>'");
  console.log("");
  console.log("New token:");
  console.log(data.access_token);
}

main();
