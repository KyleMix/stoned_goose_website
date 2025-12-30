import { motion } from "framer-motion";
import { Calendar, MapPin, Ticket } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { eventbriteShows, type EventbriteShowData } from "@/data/eventbrite";

const EVENTBRITE_PROFILE_URL =
  "https://www.eventbrite.com/o/stoned-goose-productions-107337391771";

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

function formatLocation(venue?: (typeof eventbriteShows.events)[number]["venue"]): string {
  const parts = [venue?.address, venue?.city, venue?.region]
    .filter(Boolean)
    .join(", ");

  return parts || "Location TBD";
}

export default function UpcomingShows() {
  const [showData, setShowData] = useState<EventbriteShowData>(eventbriteShows);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/eventbrite")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: EventbriteShowData | null) => {
        if (data && isMounted) {
          setShowData(data);
        }
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, []);

  const shows = useMemo(() => {
    return (
      showData.events.map((event) => ({
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
  }, [showData.events]);

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
              rel="noopener noreferrer"
            >
              View all shows on Eventbrite
            </a>
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {hasShows ? (
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
                        rel="noopener noreferrer"
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
                    <a href={EVENTBRITE_PROFILE_URL} target="_blank" rel="noopener noreferrer">
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
