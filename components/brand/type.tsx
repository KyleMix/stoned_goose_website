import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The five type roles of the Marquee system, as components.
 *
 * Weight, case, tracking and color belong to the role and are not passed in.
 * Color is surface-aware: the site's default surface is Tuxedo, and a section
 * marks itself with `data-surface="ivory"` (see `<Surface />`) to flip every
 * role inside it at once.
 *
 * The only knob these expose is `size`, and only where the spec leaves size
 * open. Reach for `className` to set layout (margin, max-width, alignment),
 * never to override weight, case, tracking or color. If a design needs a
 * sixth role, that is a question for the brand, not a prop.
 */

type Size = "1" | "2" | "3";

const SIZE_CLASS: Record<Size, string> = {
  "1": "display-1",
  "2": "display-2",
  "3": "display-3",
};

type RoleProps = {
  children: ReactNode;
 className?: string;
  as?: ElementType;
};

type SizedRoleProps = RoleProps & { size?: Size };

/** Headline. Bold 700, uppercase, +4%. Gold on tuxedo, tuxedo on ivory. */
export function Headline({
  children,
 className,
  as: Tag = "h2",
  size = "2",
}: SizedRoleProps) {
  return (
 <Tag className={cn("t-headline", SIZE_CLASS[size], className)}>
      {children}
    </Tag>
  );
}

/** Subhead. Bold 700, uppercase, +6%. Ivory on tuxedo, tuxedo on ivory. */
export function Subhead({
  children,
 className,
  as: Tag = "h3",
  size = "3",
}: SizedRoleProps) {
  return (
 <Tag className={cn("t-subhead", SIZE_CLASS[size], className)}>
      {children}
    </Tag>
  );
}

/** Eyebrow / label. Regular 400, uppercase, +26%. Gold on tuxedo, Dark Gold on ivory. */
export function Eyebrow({ children, className, as: Tag ="p" }: RoleProps) {
 return <Tag className={cn("t-eyebrow", className)}>{children}</Tag>;
}

/** Body. Light 300, sentence case, normal tracking. Ivory on tuxedo, tuxedo on ivory. */
export function Body({ children, className, as: Tag ="p" }: RoleProps) {
 return <Tag className={cn("t-body", className)}>{children}</Tag>;
}

/**
 * Fine print. Regular 400, sentence case, Smoke on both surfaces.
 *
 * Smoke on Ivory measures 3.08:1, which fails WCAG AA for small text. Keep
 * fine print on tuxedo surfaces (5.38:1) unless it renders at large size.
 */
export function FinePrint({ children, className, as: Tag ="p" }: RoleProps) {
 return <Tag className={cn("t-fine", className)}>{children}</Tag>;
}
