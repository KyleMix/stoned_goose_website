import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const coverVideoSrc = "/covervideo.mp4"; // ✅ served from client/public
const coverPosterSrc = "/opengraph.jpg";

const heroPaths = [
  {
    title: "Book a Show",
    description: "Bring a high-impact comedy night to your venue, company event, or private experience.",
    href: "/#services",
    cta: "Start Booking",
    featured: true,
  },
  {
    title: "Get Tickets",
    description: "See what's next in Olympia and across the South Sound—then lock in your seats.",
    href: "/#shows",
    cta: "Browse Shows",
  },
  {
    title: "Sponsor a Show",
    description: "Put your brand in front of local comedy fans through on-site and digital placements.",
    href: "/#sponsors",
    cta: "See Sponsorships",
  },
  {
    title: "Comic Submissions",
    description: "Submit your details to be considered for future lineups, features, and hosted events.",
    href: "/#submissions",
    cta: "Submit as a Comic",
  },
];

export default function Hero() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);

    handleChange();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden isolate"
    >
      <div className="absolute inset-0 -z-10 pointer-events-none">
        {prefersReducedMotion ? (
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src={coverPosterSrc}
            alt=""
            aria-hidden="true"
          />
        ) : (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={coverPosterSrc}
            aria-hidden="true"
          >
            <source src={coverVideoSrc} type="video/mp4" />
          </video>
        )}

        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background" />
      </div>

      <div className="container relative z-10 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-4">
            Now booking corporate events + media production
          </div>

          <h2 className="text-primary font-marker text-2xl md:text-4xl mb-4 -rotate-2">
            LIVE. LOCAL. COMEDY.
          </h2>

          <h1 className="text-6xl md:text-8xl lg:text-9xl font-display uppercase text-white mb-6 tracking-tighter leading-none text-glow">
            Stoned Goose
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Productions
            </span>
          </h1>

          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-light">
            Crafting cinematic stand-up, curated showcases, and comedy chaos across your city.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-5xl mx-auto text-left">
            {heroPaths.map((path) => (
              <div
                key={path.title}
                className={`rounded-2xl border p-5 md:p-6 bg-black/35 backdrop-blur-sm h-full ${
                  path.featured
                    ? "border-primary/80 shadow-[0_0_40px_rgba(250,204,21,0.2)]"
                    : "border-white/15"
                }`}
              >
                <h3 className="text-white text-xl font-display uppercase tracking-wide mb-2">
                  {path.title}
                </h3>
                <p className="text-gray-300 text-sm md:text-base mb-5">{path.description}</p>
                <Button
                  asChild
                  size="lg"
                  variant={path.featured ? "default" : "outline"}
                  className={`w-full font-bold uppercase tracking-wide ${
                    path.featured
                      ? "bg-primary text-black hover:bg-primary/90"
                      : "border-primary/40 text-primary hover:bg-primary/10"
                  }`}
                >
                  <a href={path.href}>{path.cta}</a>
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <a
              href="/comic-submissions"
              className="text-sm uppercase tracking-[0.2em] text-gray-200 hover:text-primary transition-colors"
            >
              Comedian? Submit your tape for roster review.
            </a>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 text-white/50"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <span className="text-sm uppercase tracking-widest">Scroll Down</span>
      </motion.div>
    </section>
  );
}
