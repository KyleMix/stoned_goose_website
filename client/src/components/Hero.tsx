import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
const coverVideoSrc = "/covervideo.mov";

export default function Hero() {
  const scrollToShows = () => {
    document.getElementById("shows")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/60 z-10" /> {/* Overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background z-10"
        />
        <video
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src={coverVideoSrc} type="video/quicktime" />
        </video>
      </div>

      {/* Content */}
      <div className="container relative z-20 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
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
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={scrollToShows}
              size="lg"
              className="bg-primary text-black hover:bg-primary/90 text-lg px-8 py-6 font-bold uppercase tracking-wide hover:scale-105 transition-transform box-glow"
            >
              See Upcoming Shows
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-primary/50 text-primary hover:bg-primary/10 text-lg px-8 py-6 font-bold uppercase tracking-wide hover:scale-105 transition-transform"
              onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
            >
              Book Us
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 text-white/50"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <span className="text-sm uppercase tracking-widest">Scroll Down</span>
      </motion.div>
    </section>
  );
}
