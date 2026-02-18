import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SectionShell } from "@/components/SectionShell";

const coverVideoSrc = "/covervideo.mp4"; // ✅ served from client/public
const coverPosterSrc = "/opengraph.jpg";

const primaryHeroPath = {
  title: "Book a Show",
  description: "Bring a high-impact comedy night to your venue, company event, or private experience.",
  href: "/#services",
  cta: "Start Booking",
};

const secondaryHeroPath = {
  title: "Get Tickets",
  description: "See what's next in Olympia and across the South Sound—then lock in your seats.",
  href: "/#shows",
  cta: "Browse Shows",
};

const tertiaryHeroLinks = [
  {
    title: "Sponsor a Show",
    href: "/#sponsors",
  },
  {
    title: "Comic Submissions",
    href: "/#submissions",
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
    <SectionShell
      id="home"
      surface="base"
      spacing="none"
      contained={false}
      className="hero-section isolate flex items-center justify-center"
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

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 text-center">
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

          <div className="max-w-4xl mx-auto text-left">
            <div className="rounded-2xl border border-primary/80 p-6 md:p-8 bg-black/40 backdrop-blur-sm shadow-[0_0_50px_rgba(250,204,21,0.28)]">
              <h3 className="text-white text-2xl md:text-3xl font-display uppercase tracking-wide mb-3">
                {primaryHeroPath.title}
              </h3>
              <p className="text-gray-100 text-base md:text-lg mb-6 max-w-2xl">
                {primaryHeroPath.description}
              </p>
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto px-10 h-14 text-base md:text-lg font-extrabold uppercase tracking-[0.12em] bg-primary text-black hover:bg-primary/90"
              >
                <a href={primaryHeroPath.href}>{primaryHeroPath.cta}</a>
              </Button>
            </div>

            <div className="mt-4 rounded-xl border border-white/15 p-5 md:p-6 bg-black/25 backdrop-blur-sm">
              <h4 className="text-white text-lg font-display uppercase tracking-wide mb-2">
                {secondaryHeroPath.title}
              </h4>
              <p className="text-gray-300 text-sm md:text-base mb-4">{secondaryHeroPath.description}</p>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full sm:w-auto font-semibold uppercase tracking-wide border-white/40 text-white/90 hover:bg-white/10 hover:text-white"
              >
                <a href={secondaryHeroPath.href}>{secondaryHeroPath.cta}</a>
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm md:text-base uppercase tracking-[0.14em]">
              {tertiaryHeroLinks.map((link) => (
                <a
                  key={link.title}
                  href={link.href}
                  className="text-gray-300 hover:text-primary transition-colors"
                >
                  {link.title}
                </a>
              ))}
            </div>
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
    </SectionShell>
  );
}
