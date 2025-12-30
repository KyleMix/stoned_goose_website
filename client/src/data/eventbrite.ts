import { eventbriteShows } from "@/data/eventbrite-data";

export type EventbriteShow = {
  id: string;
  name: string;
  start: string | null;
  end: string | null;
  url: string | null;
  summary: string;
  imageUrl?: string | null;
  venue?: {
    name?: string;
    address?: string;
    city?: string;
    region?: string;
    country?: string;
  };
};

export type EventbriteShowData = {
  updatedAt: string | null;
  events: EventbriteShow[];
};

export { eventbriteShows };
