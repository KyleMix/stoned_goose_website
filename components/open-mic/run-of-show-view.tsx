"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * The running order, for whoever is working the room.
 *
 * Built for one situation: standing near the stage on a phone, in a bar, with
 * one hand. So the names are large, the slot numbers are larger, and the only
 * interaction is picking which Monday and refreshing. Nothing here is clever.
 *
 * It shows slot, name and Instagram handle, and it cannot show anything else:
 * /api/open-mic/run-of-show does not return email addresses to the host token
 * at all. That is deliberate. This link gets forwarded to whoever is covering
 * next week, and a forwarded link should not carry twelve people's contact
 * details with it.
 *
 * The token arrives in the query string and is read from location rather than
 * useSearchParams, because this is a static export: useSearchParams forces a
 * Suspense boundary and returns nothing during prerender anyway, and this view
 * is client-only by nature.
 */

type Spot = { slot: number; name: string; instagram: string };

type RunOfShow = {
  date: string;
  dateLabel: string | null;
  slotCount: number;
  spotMinutes: number;
  showTime: string;
  venue: string;
  taken: number;
  dates: { date: string; label: string | null }[];
  spots: Spot[];
};

type State =
  | { status: "loading" }
  | { status: "no-token" }
  | { status: "denied" }
  | { status: "error"; message: string }
  | { status: "ready"; data: RunOfShow };

export function RunOfShowView() {
  const [token, setToken] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [state, setState] = useState<State>({ status: "loading" });
  const [refreshedAt, setRefreshedAt] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (!t) {
      setState({ status: "no-token" });
      return;
    }
    setToken(t);
    setDate(params.get("date"));
  }, []);

  const load = useCallback(
    async (forDate: string | null) => {
      if (!token) return;
      setState({ status: "loading" });
      const query = new URLSearchParams({ token });
      if (forDate) query.set("date", forDate);
      try {
        const response = await fetch(`/api/open-mic/run-of-show?${query}`, {
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        if (response.status === 401 || response.status === 503) {
          setState({ status: "denied" });
          return;
        }
        if (!response.ok) throw new Error(String(response.status));
        const data = (await response.json()) as RunOfShow;
        setState({ status: "ready", data });
        setDate(data.date);
        setRefreshedAt(
          new Date().toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          }),
        );
      } catch {
        setState({
          status: "error",
          message: "Could not reach the list. Check the signal and try again.",
        });
      }
    },
    [token],
  );

  useEffect(() => {
    if (token) void load(date);
    // Only on token arrival: the date is changed through pick() below, which
    // loads for itself. Re-running on every `date` change would refetch twice.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (state.status === "no-token") {
    return (
      <Note title="This page needs the host link.">
        Ask Kyle for the running order link. It has a token on the end of it,
        and without that this page has nothing to show.
      </Note>
    );
  }

  if (state.status === "denied") {
    return (
      <Note title="That link is not working.">
        The token is wrong, or it has been rotated since you saved this. Ask for
        a fresh link.
      </Note>
    );
  }

  const data = state.status === "ready" ? state.data : null;

  return (
    <div>
      {/* Which Monday. Rendered as buttons rather than a select so a thumb
          can hit them, and hidden entirely when there is only one. */}
      {data && data.dates.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {data.dates.map((d) => (
            <button
              key={d.date}
              type="button"
              onClick={() => {
                setDate(d.date);
                void load(d.date);
              }}
              className={cn(
                "inline-flex h-12 items-center border px-4 t-ui transition-colors",
                d.date === data.date
                  ? "border-accent-gold bg-accent-gold text-surface-tuxedo hover:bg-surface-ivory"
                  : "border-smoke text-surface-ivory hover:border-accent-gold hover:text-accent-gold",
              )}
            >
              {d.label ?? d.date}
            </button>
          ))}
        </div>
      ) : null}

      {data ? (
        <div className="mt-10">
          <p className="t-eyebrow">
            {data.taken} of {data.slotCount} spots taken
            {" / "}
            {data.spotMinutes} minutes each
            {" / "}
            show {data.showTime}
          </p>
          <h2 className="display-2 mt-3 text-surface-ivory">
            {data.dateLabel ?? data.date}
          </h2>

          {data.spots.length === 0 ? (
            <p className="t-body mt-8 text-base">
              Nobody has signed up for this one yet.
            </p>
          ) : (
            <ol className="mt-8 border-t border-smoke">
              {data.spots.map((spot) => (
                <li
                  key={spot.slot}
                  className="flex items-baseline gap-5 border-b border-smoke py-4"
                >
                  <span className="w-10 shrink-0 text-2xl tabular-nums text-accent-gold md:text-3xl">
                    {spot.slot}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xl text-surface-ivory md:text-2xl">
                      {spot.name}
                    </span>
                    {spot.instagram ? (
                      <a
                        href={`https://instagram.com/${spot.instagram}`}
                        target="_blank"
                        rel="noreferrer"
                        className="t-fine underline underline-offset-4 hover:text-accent-gold"
                      >
                        @{spot.instagram}
                      </a>
                    ) : null}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      ) : null}

      <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => void load(date)}
          disabled={state.status === "loading"}
          className="inline-flex h-12 items-center justify-center border border-smoke px-6 t-ui text-surface-ivory transition-colors hover:border-accent-gold hover:text-accent-gold disabled:opacity-50"
        >
          {state.status === "loading" ? "Checking..." : "Refresh"}
        </button>
        {refreshedAt ? (
          <p className="t-fine">Last checked {refreshedAt}.</p>
        ) : null}
      </div>

      {state.status === "error" ? (
        <p role="alert" className="mt-6 text-sm text-accent-gold">
          {state.message}
        </p>
      ) : null}

      <p className="t-fine mt-10 max-w-[52ch]">
        Comics who cancel drop off this list, so refresh it before you set the
        order. Spot numbers are the order people signed up in, not the order
        they have to go on in.
      </p>
    </div>
  );
}

function Note({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-smoke p-6">
      <h2 className="t-subhead text-xl md:text-2xl">{title}</h2>
      <p className="t-body mt-4 max-w-[52ch] text-base">{children}</p>
    </div>
  );
}
