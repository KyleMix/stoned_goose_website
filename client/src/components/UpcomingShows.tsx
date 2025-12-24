import { motion } from "framer-motion";
import { Calendar, MapPin, Ticket } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const EVENTBRITE_PROFILE_URL =
  "https://www.eventbrite.com/o/stoned-goose-productions-107337391771";

type EventResponse = {
  events: {
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
  }[];
};

type EventbriteEvent = {
  id: string;
  name?: { text?: string | null };
  start?: { local?: string | null };
  end?: { local?: string | null };
  url?: string | null;
  summary?: string | null;
  logo?: { url?: string | null } | null;
  venue?: {
    name?: string | null;
    address?: {
      address_1?: string | null;
      city?: string | null;
      region?: string | null;
      country?: string | null;
    } | null;
  } | null;
};

type EventbriteResponse = {
  events?: EventbriteEvent[];
};

const EVENTBRITE_TOKEN = import.meta.env.VITE_EVENTBRITE_TOKEN as string | undefined;
const EVENTBRITE_ORGANIZER_ID = import.meta.env
  .VITE_EVENTBRITE_ORGANIZER_ID as string | undefined;
const EVENTBRITE_ENDPOINT = import.meta.env.VITE_EVENTBRITE_ENDPOINT as string | undefined;

async function fetchFromEventbrite(): Promise<EventResponse> {
  if (!EVENTBRITE_TOKEN || !EVENTBRITE_ORGANIZER_ID) {
    throw new Error("Eventbrite credentials are not configured.");
  }

  const endpoint =
    EVENTBRITE_ENDPOINT ??
    `https://www.eventbriteapi.com/v3/organizers/${EVENTBRITE_ORGANIZER_ID}/events/?status=live&order_by=start_desc&expand=venue`;

  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${EVENTBRITE_TOKEN}`,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Eventbrite request failed (${response.status}): ${message || "Unknown error"}`);
  }

  const data = (await response.json()) as EventbriteResponse;

  return {
    events:
      data.events?.map((event) => ({
        id: event.id,
        name: event.name?.text ?? "Untitled Event",
        start: event.start?.local ?? null,
        end: event.end?.local ?? null,
        url: event.url ?? null,
        summary: event.summary ?? "More details available on Eventbrite.",
        imageUrl: event.logo?.url ?? null,
        venue: event.venue
          ? {
              name: event.venue.name ?? undefined,
              address: event.venue.address?.address_1 ?? undefined,
              city: event.venue.address?.city ?? undefined,
              region: event.venue.address?.region ?? undefined,
              country: event.venue.address?.country ?? undefined,
            }
          : undefined,
      })) ?? [],
  };
}

function formatDate(value: string | null) {
  if (!value) return "Date TBD";
  const date = new Date(value);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatTime(value: string | null) {
  if (!value) return "Time TBD";
  const date = new Date(value);

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatLocation(
  venue?: EventResponse["events"][number]["venue"],
): string {
  const parts = [venue?.address, venue?.city, venue?.region]
    .filter(Boolean)
    .join(", ");

  return parts || "Location TBD";
}

export default function UpcomingShows() {
  const { toast } = useToast();

  const query = useQuery<EventResponse>({
    queryKey: ["api", "eventbrite"],
    queryFn: async () => {
      try {
        return await fetchFromEventbrite();
      } catch (clientError) {
        // Fall back to the backend proxy if client-side credentials are missing or invalid
        const res = await fetch("/api/eventbrite");
        if (!res.ok) {
          throw new Error(
            clientError instanceof Error
              ? clientError.message
              : "Unable to load shows right now.",
          );
        }
        return res.json();
      }
    },
    staleTime: 60_000,
  });

  useEffect(() => {
    if (query.isError) {
      toast({
        title: "Could not load shows",
        description: (query.error as Error).message,
        variant: "destructive",
      });
    }
  }, [query.isError, query.error, toast]);

  const shows = useMemo(() => {
    return (
      query.data?.events.map((event) => ({
        id: event.id,
        title: event.name,
        date: formatDate(event.start),
        time: formatTime(event.start),
        venue: event.venue?.name ?? "Venue TBD",
        city: formatLocation(event.venue),
        description: event.summary,
        eventbriteUrl: event.url ?? EVENTBRITE_PROFILE_URL,
        imageUrl: event.imageUrl,
        isNew: false,
      })) ?? []
    );
  }, [query.data]);

  const hasShows = shows.length > 0;

  return (
    <section id="shows" className="py-20 bg-background relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div className="text-center md:text-left">
            <h2 className="text-4xl md:text-6xl font-display uppercase text-white mb-4">
              Upcoming <span className="text-primary">Shows</span>
            </h2>
            <div className="h-1 w-24 bg-secondary mx-auto md:mx-0" />
          </div>

          <Button asChild variant="outline" className="font-bold uppercase">
            <a
              href={EVENTBRITE_PROFILE_URL}
              target="_blank"
              rel="noreferrer"
            >
              View all shows on Eventbrite
            </a>
          </Button>
        </motion.div>

        {query.isError && (
          <p className="text-sm text-red-400 mb-6">
            We couldn&apos;t load shows right now. Please try again in a moment.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {query.isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="bg-card border-border h-full animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                  <div className="h-24 bg-muted rounded" />
                </CardContent>
              </Card>
            ))
          ) : hasShows ? (
            shows.map((show, index) => (
              <motion.div
                key={show.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-card border-border hover:border-primary/50 transition-colors duration-300 h-full flex flex-col overflow-hidden group relative">
                  {show.imageUrl ? (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={show.imageUrl}
                        alt={show.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                    </div>
                  ) : (
                    <div className="h-1 bg-gradient-to-r from-primary via-secondary to-primary opacity-60" />
                  )}
                  {show.isNew && (
                    <Badge className="absolute top-4 right-4 bg-secondary hover:bg-secondary text-white z-10 uppercase tracking-wider font-bold">
                      New
                    </Badge>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                  <CardHeader>
                    <h3 className="text-2xl font-display uppercase text-white group-hover:text-primary transition-colors">
                      {show.title}
                    </h3>
                  </CardHeader>

                  <CardContent className="flex-grow space-y-4">
                    <div className="flex items-center text-gray-400 gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="text-sm font-mono">
                        {show.date} • {show.time}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-400 gap-2">
                      <MapPin className="w-4 h-4 text-secondary" />
                      <span className="text-sm font-mono">
                        {show.venue} • {show.city}
                      </span>
                    </div>
                    <p className="text-gray-300 mt-4 leading-relaxed">
                      {show.description}
                    </p>
                  </CardContent>

                  <CardFooter>
                    <Button
                      asChild
                      className="w-full bg-white text-black hover:bg-primary hover:text-black transition-colors font-bold uppercase"
                    >
                      <a
                        href={show.eventbriteUrl ?? EVENTBRITE_PROFILE_URL}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Ticket className="mr-2 w-4 h-4" />
                        Get Tickets on Eventbrite
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="bg-card border-border h-full flex flex-col overflow-hidden">
                <CardHeader>
                  <h3 className="text-2xl font-display uppercase text-white">
                    No upcoming shows yet
                  </h3>
                </CardHeader>

                <CardContent className="flex-grow space-y-4 text-gray-300 leading-relaxed">
                  <p>
                    We don&apos;t have any shows on the calendar right now. Follow Stoned Goose Productions to be the first to hear when the next lineup drops.
                  </p>
                </CardContent>

                <CardFooter>
                  <Button
                    asChild
                    className="w-full bg-white text-black hover:bg-primary hover:text-black transition-colors font-bold uppercase"
                  >
                    <a href={EVENTBRITE_PROFILE_URL} target="_blank" rel="noreferrer">
                      <Ticket className="mr-2 w-4 h-4" />
                      Visit Eventbrite Profile
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
