import Image from "next/image";
import type { Member } from "@/content/members";
import { getPlaceholder } from "@/lib/placeholders";
import { cn } from "@/lib/utils";

// A card is a portrait, a name, and a title. That is the whole thing.
//
// The list this replaces gave each member a full-width 12-column row: a display
// order number in the first column, a 220px photo in the next three, and eight
// columns for a bio. Every member's bio is empty, so five people occupied
// several screens of mostly nothing. A grid of five cards says the same thing
// in one screen and reads the same on a phone.
//
// Columns: 2 below 640, 3 at 640, 5 at 1024. Five people land as 2+2+1, then
// 3+2, then a single row.

type Props = {
  members: Member[];
  /** Smaller type and tighter gaps, for the home page preview. */
  compact?: boolean;
  /** First row loads eagerly. Set on whichever grid is nearest the top. */
  priorityCount?: number;
};

export function CrewGrid({ members, compact = false, priorityCount = 0 }: Props) {
  if (members.length === 0) return null;

  return (
    <ul
      className={cn(
        "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
        compact ? "gap-x-4 gap-y-8" : "gap-x-5 gap-y-10",
      )}
    >
      {members.map((m, i) => (
        <li key={m.slug}>
          {/* Fixed 4:5 box. The ratio is set on the wrapper rather than the
              file, so a portrait the CMS uploaded at any size still lands in
              the same slot and the row never shifts as images arrive. */}
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface-tuxedo">
            <Image
              src={m.photo}
              alt={m.photoAlt || m.name}
              fill
              sizes="(min-width: 1024px) 18vw, (min-width: 640px) 30vw, 45vw"
              {...(getPlaceholder(m.photo)
                ? {
                    placeholder: "blur" as const,
                    blurDataURL: getPlaceholder(m.photo)!,
                  }
                : {})}
              priority={i < priorityCount}
              loading={i < priorityCount ? undefined : "lazy"}
              // object-position sits above centre so faces land in the frame
              // rather than being cropped at the chin.
              className="object-cover object-[50%_25%] [filter:grayscale(1)_contrast(1.05)]"
            />
          </div>
          <h3
            className={cn(
              "mt-3 t-subhead",
              compact ? "text-sm md:text-base" : "text-base md:text-lg",
            )}
          >
            {m.name}
          </h3>
          {m.role ? (
            <p className="t-body mt-1 text-sm text-smoke">{m.role}</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
