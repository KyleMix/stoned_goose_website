"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * The landing page for a link in the confirmation email.
 *
 * Both links work the same way, so they share this: read the token out of the
 * query, ask the API what it refers to, show the person what is about to
 * happen, and do it only when they press the button.
 *
 * That last part is the reason this page exists at all rather than the email
 * linking straight at an endpoint. Mail clients, security scanners and link
 * previewers fetch URLs in messages without anybody clicking. A cancel that
 * happened on GET would release spots on its own, silently, and the comic
 * would turn up to find they were not on the list. So GET only ever reads, and
 * the button POSTs.
 */

export type LinkActionCopy = {
  /** API route, e.g. "/api/open-mic/cancel". */
  endpoint: string;
  /** Shown while the token is being checked. */
  loadingText: string;
  /** The sentence describing what the button is about to do. */
  describe: string;
  /** Button label for the action. */
  confirmLabel: string;
  /** Heading and body once it is done. */
  doneTitle: string;
  doneBody: string;
  /** Heading and body when the token is valid but there is nothing left to do. */
  alreadyTitle: string;
  alreadyBody: string;
  /** Heading and body when the token does not match anything. */
  goneTitle: string;
  goneBody: string;
  /** Heading and body when the URL has no token at all. */
  noTokenTitle: string;
  noTokenBody: string;
};

/**
 * The copy strings take `{slot}`, `{dateLabel}` and `{name}` placeholders,
 * filled from whatever the API reported about the token.
 *
 * Plain strings rather than render functions, because this is a client island
 * and the pages that configure it are server components: a function cannot
 * cross that boundary, and passing one fails the static export at build time
 * rather than at runtime. Placeholders keep the wording at the call site,
 * which is where somebody looks for it.
 */
function fill(template: string, detail: Detail): string {
  return template.replace(/\{(slot|dateLabel|name)\}/g, (_, key: string) => {
    const value = detail[key as "slot" | "dateLabel" | "name"];
    return value == null ? "" : String(value);
  });
}

type Detail = {
  found?: boolean;
  alreadyGone?: boolean;
  already?: boolean;
  cancelled?: boolean;
  removed?: boolean;
  name?: string;
  dateLabel?: string | null;
  date?: string;
  slot?: number;
};

type State =
  | { status: "loading" }
  | { status: "no-token" }
  | { status: "gone" }
  | { status: "ready"; detail: Detail }
  | { status: "already"; detail: Detail }
  | { status: "done"; detail: Detail }
  | { status: "error"; message: string };

export function LinkAction({ copy }: { copy: LinkActionCopy }) {
  const [token, setToken] = useState<string | null>(null);
  const [state, setState] = useState<State>({ status: "loading" });
  const [working, setWorking] = useState(false);

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("t");
    if (!t) {
      setState({ status: "no-token" });
      return;
    }
    setToken(t);
  }, []);

  const look = useCallback(async (t: string) => {
    try {
      const response = await fetch(
        `${copy.endpoint}?t=${encodeURIComponent(t)}`,
        { headers: { Accept: "application/json" }, cache: "no-store" },
      );
      const detail = (await response.json().catch(() => ({}))) as Detail;
      if (!response.ok || detail.found === false) {
        setState({ status: "gone" });
        return;
      }
      if (detail.already) {
        setState({ status: "already", detail });
        return;
      }
      setState({ status: "ready", detail });
    } catch {
      setState({
        status: "error",
        message: "Could not reach the list. Try again in a moment.",
      });
    }
    // copy.endpoint is a constant per page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (token) void look(token);
  }, [token, look]);

  async function confirm() {
    if (!token) return;
    setWorking(true);
    try {
      const response = await fetch(copy.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ token }),
      });
      const detail = (await response.json().catch(() => ({}))) as Detail;
      if (!response.ok) throw new Error(String(response.status));
      setState({ status: "done", detail });
    } catch {
      setState({
        status: "error",
        message: "That did not go through. Try again, or reply to the email.",
      });
    } finally {
      setWorking(false);
    }
  }

  if (state.status === "loading") {
    return <p className="t-body text-base">{copy.loadingText}</p>;
  }

  if (state.status === "no-token") {
    return <Panel title={copy.noTokenTitle}>{copy.noTokenBody}</Panel>;
  }

  if (state.status === "gone") {
    return <Panel title={copy.goneTitle}>{copy.goneBody}</Panel>;
  }

  if (state.status === "error") {
    return (
      <Panel title="Something went wrong.">
        <span role="alert">{state.message}</span>
      </Panel>
    );
  }

  if (state.status === "already") {
    return (
      <Panel title={copy.alreadyTitle}>
        {fill(copy.alreadyBody, state.detail)}
      </Panel>
    );
  }

  if (state.status === "done") {
    return (
      <Panel title={copy.doneTitle} accent>
        {fill(copy.doneBody, state.detail)}
      </Panel>
    );
  }

  return (
    <div>
      <p className="t-body max-w-[52ch] text-base md:text-lg">
        {fill(copy.describe, state.detail)}
      </p>
      <button
        type="button"
        onClick={() => void confirm()}
        disabled={working}
        className="mt-8 inline-flex h-12 items-center justify-center bg-accent-gold px-7 t-ui text-surface-tuxedo transition-colors hover:bg-surface-ivory disabled:opacity-50"
      >
        {working ? "One moment..." : copy.confirmLabel}
      </button>
    </div>
  );
}

function Panel({
  title,
  accent,
  children,
}: {
  title: string;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      role="status"
      className={`border p-6 ${accent ? "border-accent-gold" : "border-smoke"}`}
    >
      <h2 className="t-subhead text-xl md:text-2xl">{title}</h2>
      <p className="t-body mt-4 max-w-[52ch] text-base">{children}</p>
    </div>
  );
}
