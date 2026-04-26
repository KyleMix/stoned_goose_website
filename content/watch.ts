export type Reel = {
  title: string;
  url: string;
  poster: string;
  platform: "instagram" | "youtube";
};

export const reels: Reel[] = [
  {
    title: "Halloween Comedy Costume Contest",
    url: "https://www.instagram.com/reel/DP3Uddejt-n/",
    poster: "/images/media/halloween.png",
    platform: "instagram",
  },
  {
    title: "Matt Loes - Krusty The Clown Impression",
    url: "https://www.instagram.com/reel/DMhDTw7up7Q/",
    poster: "/images/media/matt-loes.png",
    platform: "instagram",
  },
];

export const watchCopy = {
  heading: "Media & Clips",
  subhead: "Watch clips, reels, and full sets from Stoned Goose Productions.",
  emptyClipsLine:
    "No videos available yet. Check out our channel for the latest uploads.",
};
