"use client";

// Inline Cal.com scheduler for the /book page. The page only renders this
// when Site config has a booking link, so the section ships dormant and
// lights up from /admin with no code change.

import { useEffect } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";
import { track } from "@/lib/analytics";

const NAMESPACE = "intro-call";

export function BookCallEmbed({ calLink }: { calLink: string }) {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cal = await getCalApi({ namespace: NAMESPACE });
      if (cancelled) return;
      cal("ui", {
        theme: "dark",
        layout: "month_view",
        cssVarsPerTheme: {
          dark: { "cal-brand": "#F2EA00" },
          light: { "cal-brand": "#0A0A0A" },
        },
        hideEventTypeDetails: false,
      });
      cal("on", {
        action: "bookingSuccessful",
        callback: () => track("Call Booked", { source: "/book" }),
      });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Cal
      namespace={NAMESPACE}
      calLink={calLink}
      style={{ width: "100%" }}
      config={{ layout: "month_view", theme: "dark" }}
    />
  );
}
