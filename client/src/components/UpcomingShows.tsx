import { motion } from "framer-motion";
import { Calendar, MapPin, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const EVENTBRITE_PROFILE_URL =
  "https://www.eventbrite.com/o/stoned-goose-productions-107337391771";

const shows = [
  {
    id: 1,
    title: "Comedy Night At The BeatDrop: Brandon White",
    date: "Jan 16, 2026",
    time: "8:00 PM",
    venue: "The BeatDrop",
    city: "Lacey, WA",
    description:
      "Brandon White is headlining the Stoned Goose Monthly Stand Up Night @ The BeatDrop in Lacey, WA.",
    eventbriteUrl: "https://www.eventbrite.com/e/stand-up-comedy-stoned-goose-productions-brandon-white-tickets-1976967260294?utm-campaign=social&utm-content=attendeeshare&utm-medium=discovery&utm-term=listing&utm-source=cp&aff=ebdsshcopyurl",
    isNew: false,
  },
  {
    id: 2,
    title: "Comedy Night At The BeatDrop: Logan Cantrell",
    date: "Feb 20, 2026",
    time: "8:00 PM",
    venue: "The The BeatDrop",
    city: "Lacey, WA",
    description: "Logan Cantrell is headlining the Stoned Goose Monthly Stand Up Night @ The BeatDrop in Lacey, WA.",
    eventbriteUrl: "https://www.eventbrite.com/e/stand-up-comedy-stoned-goose-productions-logan-cantrell-tickets-1977432286199?aff=oddtdtcreator",
    isNew: true,
  },
  // Add more shows here…
];

export default function UpcomingShows() {
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {shows.map((show, index) => (
            <motion.div
              key={show.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-card border-border hover:border-primary/50 transition-colors duration-300 h-full flex flex-col overflow-hidden group relative">
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
                      {show.venue}, {show.city}
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
          ))}
        </div>
      </div>
    </section>
  );
}
