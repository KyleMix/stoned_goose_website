// Extract a YouTube video id from a watch / share / embed / shorts URL. When
// the input is already a bare 11-char id we return it as-is. Shared by the
// /watch fallback path that maps the hand-curated youtubeVideos list into the
// inline-play grid shape.
export function extractYouTubeId(url: string): string | null {
  if (/^[A-Za-z0-9_-]{11}$/.test(url)) return url;
  const m = url.match(
    /(?:v=|\/embed\/|youtu\.be\/|\/v\/|\/shorts\/)([A-Za-z0-9_-]{11})/,
  );
  return m ? m[1] : null;
}
