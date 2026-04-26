import { stats } from "@/content/home";

export function StatsBand() {
  return (
    <section
      aria-label="By the numbers"
      className="border-b border-bone/10 bg-ink"
    >
      <ul className="mx-auto grid max-w-[1400px] grid-cols-2 px-5 md:grid-cols-4 md:px-10">
        {stats.map((s, i) => (
          <li
            key={s.label}
            className={[
              "flex items-baseline gap-3 py-5 md:py-6",
              i > 0 && "md:border-l border-bone/10",
              i === 1 && "border-l border-bone/10",
              i >= 2 && "border-t border-bone/10 md:border-t-0",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span className="font-display text-2xl text-bone md:text-3xl">
              {s.value}
            </span>
            <span className="font-body text-[11px] font-medium uppercase tracking-[0.18em] text-bone/55">
              {s.label}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
