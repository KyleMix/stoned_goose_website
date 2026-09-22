"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FormProvider, useForm, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField } from "@/components/form-field";
import { site } from "@/content/site";
import { track } from "@/lib/analytics";
import { formatCivilDateLong, formatCivilDateShort } from "@/lib/dates";
import { openMicSignupSchema } from "@/lib/form-schemas";
import {
  MIC_SLOT_COUNT,
  MIC_SPOT_MINUTES,
  MIC_WINDOW_WEEKS,
  micWindow,
  type CivilDate,
  type MicAvailability,
  type MicSlotsResponse,
} from "@/lib/open-mic-schedule";
import { cn } from "@/lib/utils";

/**
 * The pre sign up list: four Mondays, twelve eight minute spots each.
 *
 * What a comic sees is a count. "5 of 12 left" on each Monday, and nothing
 * about who has the other seven. That is the room's rule and it is enforced in
 * worker/index.ts, which has no endpoint that returns a name without the
 * export token: this component could not render the list even if it wanted to.
 *
 * Why the dates are not server rendered.
 *
 * This page is a static export. Its HTML is built once and then served from
 * cache for as long as nobody deploys, so anything on it that depends on
 * today's date is frozen at build time. Both halves of this board are exactly
 * that: the four Mondays roll over every Tuesday, and the counts change every
 * time somebody signs up.
 *
 * Rendering the window at build time would put four specific dates into the
 * HTML, and a week later that HTML is advertising a Monday that has already
 * happened until React hydrates and swaps it out. That is both a hydration
 * mismatch and, for the moment before hydration, a wrong date on the primary
 * content of the page. So the server renders the format and a placeholder
 * board, and the dates and counts both arrive after mount. Nothing here ever
 * ships a date the page cannot stand behind.
 *
 * The cost is that the Mondays need JavaScript. The page around this section
 * does not: the venue, the times, the format and how it works are all static,
 * and <noscript> in the page points at our email.
 */

const SLOTS_ENDPOINT = "/api/open-mic/slots";
const SIGNUP_ENDPOINT = "/api/open-mic/signup";

// Matches MIN_FILL_MS in worker/index.ts and the contact form's time trap.
const MIN_FILL_MS = 2500;

type Values = {
  date: string;
  name: string;
  email: string;
  instagram: string;
};

type Availability = Map<CivilDate, MicAvailability>;

/**
 * "pending" is the pre-mount render, and the only state the server produces.
 * "offline" means the Worker did not answer: the dates are known, the counts
 * are not, and the board says so rather than inventing twelve.
 */
type LoadState = "pending" | "loading" | "ready" | "offline";

type Confirmed = { date: CivilDate; slot: number };

export type SignupCopy = {
  eyebrow: string;
  heading: string;
  body: string;
  nameLabel: string;
  emailLabel: string;
  instagramLabel: string;
  submitLabel: string;
  privacyNote: string;
  fullText: string;
  offlineText: string;
};

export function OpenMicSignupBoard({ copy }: { copy: SignupCopy }) {
  // The four Mondays on the board. Null until mount: see the note above, the
  // window is a function of today's date and this HTML is built once. Named
  // `mondays` rather than `window` so it does not shadow the global in a file
  // that calls fetch.
  const [mondays, setMondays] = useState<CivilDate[] | null>(null);
  const [availability, setAvailability] = useState<Availability>(new Map());
  const [load, setLoad] = useState<LoadState>("pending");
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<Confirmed | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const mountedAtRef = useRef(0);
  const honeyRef = useRef<HTMLInputElement>(null);

  const methods = useForm<Values>({
    mode: "onTouched",
    defaultValues: { date: "", name: "", email: "", instagram: "" },
    resolver: zodResolver(openMicSignupSchema),
  });

  const refresh = useCallback(async () => {
    try {
      const response = await fetch(SLOTS_ENDPOINT, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (!response.ok) throw new Error(String(response.status));
      const data = (await response.json()) as MicSlotsResponse;
      setAvailability(new Map(data.dates.map((d) => [d.date, d])));
      setLoad("ready");
    } catch {
      // The dates and the format still render. The counts do not, and the
      // cards say "12 spots" rather than a number the page made up.
      setLoad("offline");
    }
  }, []);

  useEffect(() => {
    mountedAtRef.current = Date.now();
    // One window for the lifetime of the mount. Recomputing on a timer would
    // renumber the cards under a half-filled form if a comic left the tab open
    // over midnight on a Monday.
    const dates = micWindow();
    setMondays(dates);
    setLoad("loading");
    methods.setValue("date", dates[0]);
    void refresh();
    // methods is stable for the life of the form; refresh is memoised on [].
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  // The radio group is the only record of which Monday is picked, so the
  // heading and the submit button read it rather than keeping a second copy
  // that could drift out of step with the input the form submits.
  const selected = methods.watch("date") || null;

  // Nudge the selection off a Monday that filled up while the page was open,
  // so the first thing a comic does is not submit into a 409.
  useEffect(() => {
    if (load !== "ready" || confirmed || !mondays || !selected) return;
    if ((availability.get(selected)?.remaining ?? 1) > 0) return;
    const open = mondays.find((d) => (availability.get(d)?.remaining ?? 0) > 0);
    if (open) methods.setValue("date", open);
  }, [availability, load, selected, mondays, confirmed, methods]);

  async function onSubmit(values: Values) {
    const honey = honeyRef.current?.value ?? "";
    const elapsedMs = mountedAtRef.current
      ? Date.now() - mountedAtRef.current
      : Infinity;

    // See the time trap note in components/contact-form.tsx. Both checks fail
    // silently into the confirmation rather than naming themselves.
    if (honey.trim() !== "" || elapsedMs < MIN_FILL_MS) {
      setConfirmed({ date: values.date, slot: 0 });
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const response = await fetch(SIGNUP_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ ...values, honey, elapsedMs }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        slot?: number | null;
        error?: string;
        field?: keyof Values;
      };

      if (!response.ok) {
        if (data.field && data.field in methods.getValues()) {
          methods.setError(data.field, { message: data.error });
        } else {
          setFormError(data.error ?? copy.offlineText);
        }
        // A 409 means somebody else got there first. Re-read the counts so
        // the board agrees with the message.
        void refresh();
        return;
      }

      setConfirmed({ date: values.date, slot: data.slot ?? 0 });
      methods.reset({ date: values.date, name: "", email: "", instagram: "" });
      track("Form Submit", { form: "open-mic-signup" });
      void refresh();
    } catch {
      setFormError(copy.offlineText);
    } finally {
      setSubmitting(false);
    }
  }

  // Four cards either way, so the section does not change height on mount.
  const cards: (CivilDate | null)[] =
    mondays ?? Array.from({ length: MIC_WINDOW_WEEKS }, () => null);

  const everythingFull =
    load === "ready" &&
    mondays !== null &&
    mondays.every((d) => (availability.get(d)?.remaining ?? 0) <= 0);

  return (
    <div className="grid gap-12 md:grid-cols-12 md:gap-x-12">
      <div className="md:col-span-7">
        <p className="t-eyebrow">{copy.eyebrow}</p>
        <h2 id="log-cabin-signup" className="display-2 mt-4 text-surface-ivory">
          {copy.heading}
        </h2>
        <p className="t-body mt-6 max-w-[50ch] text-base md:text-lg">
          {copy.body}
        </p>

        {/* Real radio inputs, not buttons with role="radio".
            Picking a Monday is choosing one of a set, and a native radio group
            brings arrow-key navigation, a single tab stop, and the form
            semantics with it. Hand-rolled buttons with the radio role look
            identical and do none of that: arrow keys just do nothing, which is
            worse than an obviously plain button. The inputs are sr-only and
            the card is the label, so the tap target is the whole card. */}
        <fieldset className="mt-10">
          <legend className="sr-only">Pick a Monday</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {cards.map((date, i) => (
              <DateCard
                key={date ?? `pending-${i}`}
                date={date}
                availability={date ? availability.get(date) : undefined}
                load={load}
                fullText={copy.fullText}
                register={methods.register}
                onPick={() => setFormError(null)}
              />
            ))}
          </div>
        </fieldset>

        <p className="t-fine mt-6 max-w-[52ch]">{copy.privacyNote}</p>
      </div>

      <div className="md:col-span-5">
        {confirmed ? (
          <Confirmation
            confirmed={confirmed}
            onAgain={() => {
              setConfirmed(null);
              void refresh();
            }}
          />
        ) : (
          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className="space-y-7"
              noValidate
            >
              <p className="t-eyebrow">
                {selected
                  ? `Signing up for ${formatCivilDateLong(selected)}`
                  : `${MIC_SLOT_COUNT} spots, ${MIC_SPOT_MINUTES} minutes each`}
              </p>

              <TextField
                id="mic-name"
                name="name"
                label={copy.nameLabel}
                required
                autoComplete="name"
              />
              <TextField
                id="mic-email"
                name="email"
                type="email"
                label={copy.emailLabel}
                required
                autoComplete="email"
              />
              <TextField
                id="mic-instagram"
                name="instagram"
                label={copy.instagramLabel}
                required
                placeholder="@yourhandle"
                autoComplete="off"
              />

              <input
                ref={honeyRef}
                type="text"
                name="_honey"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute left-[-9999px] h-0 w-0 opacity-0"
              />

              <button
                type="submit"
                disabled={submitting || !selected || everythingFull}
                className="group inline-flex h-12 w-full items-center justify-center gap-3 bg-accent-gold px-7 t-ui text-surface-tuxedo transition-colors hover:bg-surface-ivory disabled:opacity-50 md:w-auto"
              >
                {submitting ? "Taking your spot..." : copy.submitLabel}
                <span
                  aria-hidden
                  className="transition-transform group-hover:translate-x-1"
                >
                  →
                </span>
              </button>

              {everythingFull ? (
                <p role="status" className="t-body text-sm">
                  Every Monday on the list is full. The next one posts Tuesday
                  morning.
                </p>
              ) : null}

              {formError ? (
                <p role="alert" className="text-sm text-accent-gold">
                  {formError}{" "}
                  <a
                    href={`mailto:${site.contact.email}`}
                    className="underline underline-offset-4"
                  >
                    {site.contact.email}
                  </a>
                </p>
              ) : null}
            </form>
          </FormProvider>
        )}
      </div>
    </div>
  );
}

/**
 * One Monday, or a placeholder before mount.
 *
 * All of the selected styling is `peer-checked:`, driven by the radio itself
 * rather than by React state, so the card cannot disagree with the input the
 * form actually reads.
 *
 * Selected is gold, which per the brand means its hover has to be ivory so a
 * selected card and a hovered card stay tellable apart. Unselected is a smoke
 * hairline that goes gold on hover. No fill animation, no shadow, no second
 * accent.
 *
 * The `peer-checked:text-surface-tuxedo` on each inner span is not a redundant
 * restatement of the type role's color: `.t-ui` sets its own color and would
 * beat anything inherited from the card, leaving an ivory label on a gold fill
 * at 1.88:1, the one pair the brand rules out outright.
 */
function DateCard({
  date,
  availability,
  load,
  fullText,
  register,
  onPick,
}: {
  date: CivilDate | null;
  availability: MicAvailability | undefined;
  load: LoadState;
  fullText: string;
  register: UseFormRegister<Values>;
  onPick: () => void;
}) {
  const full = load === "ready" && (availability?.remaining ?? 1) <= 0;
  const disabled = !date || full;

  // Four sets of words for four genuinely different states. An unknown count
  // says "12 spots", the format, rather than "12 of 12 left", a number the
  // page would be making up.
  const status =
    load === "pending"
      ? "Loading"
      : load === "loading"
        ? "Checking the list"
        : load === "offline"
          ? `${MIC_SLOT_COUNT} spots`
          : full
            ? fullText
            : `${availability?.remaining ?? MIC_SLOT_COUNT} of ${MIC_SLOT_COUNT} left`;

  return (
    <label className="block cursor-pointer has-[:disabled]:cursor-not-allowed">
      <input
        type="radio"
        value={date ?? ""}
        disabled={disabled}
        className="peer sr-only"
        {...register("date", { onChange: onPick })}
      />
      <span
        className={cn(
          "flex min-h-[88px] flex-col items-start justify-between border border-smoke p-4 transition-colors",
          "peer-hover:border-accent-gold peer-hover:text-accent-gold",
          "peer-checked:border-accent-gold peer-checked:bg-accent-gold peer-checked:hover:bg-surface-ivory",
          // Flat 2px gold outline, same focus treatment as every other
          // control on a tuxedo surface.
          "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-accent-gold",
          "peer-disabled:opacity-50 peer-disabled:hover:border-smoke peer-disabled:hover:text-surface-ivory",
          // Both inner spans, reached from here rather than styled on
          // themselves: `peer-*` only matches siblings of the input, and the
          // labels are its nephews. This is the one selector in the file that
          // has to know the markup shape.
          "peer-checked:[&>span]:text-surface-tuxedo",
        )}
      >
        <span className="t-ui">
          {date ? formatCivilDateShort(date) : "Monday"}
        </span>
        <span className="mt-3 text-[11px] uppercase tracking-[0.18em] text-smoke">
          {status}
        </span>
      </span>
    </label>
  );
}

function Confirmation({
  confirmed,
  onAgain,
}: {
  confirmed: Confirmed;
  onAgain: () => void;
}) {
  return (
    <div role="status" className="border border-accent-gold p-6">
      <p className="t-eyebrow">You are on the list</p>
      <p className="t-subhead mt-4 text-xl md:text-2xl">
        {formatCivilDateLong(confirmed.date)}
      </p>
      <p className="t-body mt-4 text-base">
        {confirmed.slot > 0
          ? `Spot ${confirmed.slot} of ${MIC_SLOT_COUNT}. You have ${MIC_SPOT_MINUTES} minutes.`
          : `You have ${MIC_SPOT_MINUTES} minutes.`}{" "}
        Running order goes up the night of, so turn up ready.
      </p>
      <button
        type="button"
        onClick={onAgain}
        className="mt-6 inline-flex h-12 items-center border border-smoke px-6 t-ui text-surface-ivory transition-colors hover:border-accent-gold hover:text-accent-gold"
      >
        Sign up another Monday
      </button>
    </div>
  );
}
