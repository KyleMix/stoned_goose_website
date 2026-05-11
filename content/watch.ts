// Watch copy shim. Reads the Keystatic-managed singleton.

import watchData from "./watch-copy/index.json";

type WatchCopy = {
  heading: string;
  subhead: string;
  emptyClipsLine: string;
};

export const watchCopy = watchData as WatchCopy;
