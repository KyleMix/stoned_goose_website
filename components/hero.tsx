"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { hero, stats } from "@/content/home";

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section
      aria-label="Hero"
      className="relative isolate min-h-[100svh] overflow-hidden border-b border-bone/10"
    >
      <div aria-hidden className="absolute inset-0 -z-10">
        {reduce ? (
          <img
            src="/opengraph.jpg"
            alt=""
            className="h-full w-full object-cover halftone opacity-60"
          />
        ) : (
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            poster="/opengraph.jpg"
            className="h-full w-full object-cover opacity-60 [filter:grayscale(1)_contrast(1.05)]"
          >
            <source src="/covervideo.mp4" type="video/mp4" />
          </video>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/55 via-ink/30 to-ink" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(242,234,0,0.08),transparent_60%)]" />
      </div>

      <div className="relative mx-auto grid min-h-[100svh] max-w-[1400px] grid-cols-12 gap-x-6 px-5 pb-24 pt-32 md:px-10 md:pt-40">
        <div className="col-span-12 grid grid-cols-12 items-end gap-y-10 md:col-span-12">
          <header className="col-span-12 md:col-span-7">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="font-mono text-[10px] uppercase tracking-eyebrow text-bone/55"
            >
              [ Vol. 01 / Bumper / Now Playing ]
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.1 }}
              className="heading-display mt-4 text-[clamp(3.4rem,11.5vw,11rem)] text-bone"
            >
              <span className="block">Stoned</span>
              <span className="block italic text-bone/85">
                Goose<span className="not-italic text-hazard">.</span>
              </span>
              <span className="block">Productions</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mt-8 max-w-md font-body text-base leading-relaxed text-bone/75 md:text-lg"
            >
              {hero.subhead}
            </motion.p>
          </header>

          <aside className="col-span-12 flex flex-col gap-3 md:col-span-5 md:items-end md:text-right">
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.55 }}
              className="font-mono text-[10px] uppercase tracking-eyebrow text-hazard"
            >
              {hero.eyebrow}
            </motion.div>
            <motion.p
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.65 }}
              className="font-display text-3xl italic text-bone md:text-5xl"
            >
              {hero.tagline.toLowerCase()}
            </motion.p>
          </aside>

          <div className="col-span-12 mt-6 grid grid-cols-12 gap-y-6 border-t border-bone/15 pt-10 md:gap-x-8">
            <div className="col-span-12 md:col-span-7">
              <p className="font-mono text-[10px] uppercase tracking-eyebrow text-bone/45">
                01 / Primary
              </p>
              <h2 className="heading-display mt-3 text-3xl text-bone md:text-5xl">
                {hero.primary.title}
              </h2>
              <p className="mt-3 max-w-md font-body text-sm text-bone/70 md:text-base">
                {hero.primary.body}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-4">
                <Link
                  href={hero.primary.href}
                  className="group inline-flex h-12 items-center gap-3 bg-hazard px-6 font-mono text-xs uppercase tracking-[0.22em] text-ink transition-colors hover:bg-bone"
                >
                  {hero.primary.label}
                  <span aria-hidden className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Link>
                <Link
                  href={hero.secondary.href}
                  className="font-mono text-xs uppercase tracking-[0.22em] text-bone/70 underline-offset-4 hover:text-hazard hover:underline"
                >
                  {hero.secondary.label} ↗
                </Link>
              </div>
            </div>

            <div className="col-span-12 md:col-span-5">
              <p className="font-mono text-[10px] uppercase tracking-eyebrow text-bone/45">
                02 / Adjacent
              </p>
              <p className="mt-3 max-w-sm font-body text-sm text-bone/70 md:text-base">
                {hero.secondary.body}
              </p>
              <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[11px] uppercase tracking-[0.22em] text-bone/55">
                {hero.tertiary.map((t) => (
                  <li key={t.href}>
                    <Link
                      href={t.href}
                      className="transition-colors hover:text-hazard"
                    >
                      {t.label} ↗
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-12 left-0 right-0 select-none whitespace-nowrap text-center font-display tracking-display text-bone/[0.03]"
        style={{ fontSize: "clamp(7rem, 26vw, 22rem)", lineHeight: 0.8 }}
      >
        STONED GOOSE
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 border-t border-bone/15 bg-ink/60 backdrop-blur-sm">
        <ul className="mx-auto grid max-w-[1400px] grid-cols-2 px-5 md:grid-cols-4 md:px-10">
          {stats.map((s, i) => (
            <li
              key={s.label}
              className={`flex items-baseline gap-3 py-4 ${
                i > 0 ? "md:border-l border-bone/10" : ""
              } ${i === 1 ? "border-l border-bone/10 md:border-l" : ""} ${
                i >= 2 ? "border-t border-bone/10 md:border-t-0" : ""
              }`}
            >
              <span className="font-display text-2xl text-bone md:text-3xl">
                {s.value}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-eyebrow text-bone/55">
                {s.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
