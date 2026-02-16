# Stoned Goose Productions — Interaction & Motion Plan

## 0) Stack detection (before coding)

### Detected stack
- **Front end:** React 19 + TypeScript, bundled with **Vite**. 
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`) plus utility classes in component JSX and global styles in `client/src/index.css`.
- **Routing:** `wouter` (client-side SPA routes).
- **Back end:** Node/Express server serving API endpoints and static built assets (`dist/public`) for production.
- **Deployment shape inferred from code:** Built SPA assets served by Express; can sit behind Nginx, but no Nginx/SSL/DNS changes are required for this motion work.

### Existing animation-related libraries and patterns
- **Already installed and actively used:** `framer-motion` (used in multiple section components).
- **Also present:** `tw-animate-css` for utility animation classes (e.g., Sheet/Toast enter-exit states).
- **Current patterns:** Mixed motion approaches (Framer `motion.div` + Tailwind transitions) and per-component timings/easings rather than one shared motion language.

### File structure and where UI lives
- `client/src/components/*` → primary reusable UI sections and widgets (Hero, Services, UpcomingShows, Comedians, Merch, Media, Contact, Navbar, Footer, etc.).
- `client/src/pages/*` → route-level pages (`home`, `services`, `book-a-show`, `comic-submissions`, `sponsorships`, etc.).
- `client/src/components/ui/*` → shared primitives (`button`, `input`, `card`, `sheet`, `toast`, etc.).
- `client/src/index.css` → global theme tokens/utilities.
- `server/index.ts` → Express API/static file serving.

---

## Phase 1 — Audit & Inventory

> Goal: identify interactive elements currently on-site and where they appear.

### A. Primary/secondary buttons
- **Global button primitive** (`ui/button.tsx`) supports `default`, `secondary`, `outline`, `ghost`, `link`, with hover/active/focus transitions.
- **High-visibility CTA instances**:
  - Hero CTAs (“Start Booking”, “Browse Shows”).
  - Navbar “Book Services”.
  - Services section CTA row + card CTAs.
  - Upcoming Shows “View all shows on Eventbrite”, “Get Tickets”.
  - Contact/Service/Book/Sponsorship form submit actions.
  - Merch product/shop CTAs.

### B. Links / nav items
- **Desktop + mobile nav links** in `Navbar` (active state, hover color/border changes).
- **Social icon links** in Navbar and Footer.
- **Inline tertiary links** in Hero and detail/service pages.
- **No traditional dropdown menu found**; mobile navigation uses a Radix `Sheet` slide-over panel.

### C. Cards
- **Services cards** (home + services page).
- **Show listing cards** (Upcoming Shows).
- **Comedian cards/headshots** (Comedians).
- **Sponsorship/package/tier cards**.
- **Contact/info cards**, merch product cards, and utility cards across pages.

### D. Photos and media
- **Hero background video/poster** with reduced-motion fallback image.
- **Comedian headshots** with overlay/caption interaction.
- **Merch product images** (already using lazy-loading).
- **Media gallery/video previews** and page imagery.
- **No explicit lightbox component detected in current code.**

### E. Forms
- **Contact form** (`Contact`).
- **Service quote forms** (`Services`, `ServiceLeadForm`, service detail page usage).
- **Book-a-show qualification form**.
- **Comic submissions form**.
- **Sponsorship inquiry form**.
- **Show updates email capture** in Upcoming Shows.

### F. Section transitions/reveals
- Multiple sections already reveal via Framer (`initial` + `whileInView`) with varied offsets and delays.
- `Navbar` uses `IntersectionObserver` for active-section highlighting (not reveal animation yet).

---

## Phase 2 — Motion design system (tokens + rules)

Create one shared motion language as CSS custom properties (in `index.css`) and optional JS constants for Framer/IO.

### Motion tokens

```css
:root {
  --motion-duration-micro: 120ms;
  --motion-duration-standard: 220ms;
  --motion-duration-emphasis: 360ms;

  --motion-ease-standard: cubic-bezier(0.22, 1, 0.36, 1);
  --motion-ease-emphasis: cubic-bezier(0.16, 1, 0.3, 1);

  --motion-lift-y: -2px;
  --motion-press-y: 1px;
  --motion-reveal-y: 12px;
  --motion-stagger: 80ms;
}
```

### Usage rules
- **Micro (100–150ms):** press, icon nudge, quick opacity toggles.
- **Standard (180–240ms):** hover/focus transitions for buttons, links, cards, inputs.
- **Emphasis (300–450ms):** menu open/close, section reveals, modal/lightbox (if present).
- **Default easing:** `--motion-ease-standard`; use `--motion-ease-emphasis` only for enters/exits of larger UI blocks.

### State model (hover / active / focus)
- **Hover:** subtle translateY + color/border/opacity changes.
- **Active/pressed:** return toward baseline or `translateY(1px)` with **micro duration**.
- **Focus-visible:** persistent high-contrast ring and outline; never rely on motion alone for affordance.

### Scroll reveal rules
- Apply to section wrappers and card grids only (not every text line).
- Reveal style: `opacity: 0 → 1` + `translateY(12px → 0)`.
- Stagger in grids: **60–100ms** per item.
- Run policy: once per page load by default (`once: true`), configurable per section for recurring elements.

### Reduced-motion behavior
- Under `prefers-reduced-motion: reduce`:
  - Remove transform-based movement and repeated/bouncing loops.
  - Keep color/focus/opacity changes minimal and near-instant.
  - Section reveals become immediate (or tiny opacity-only fade ≤100ms).

---

## Phase 3 — Component animation specs

## A) Buttons (primary, secondary, ghost)
- **Trigger:** hover, focus-visible, active/tap.
- **Animated properties:** `transform`, `box-shadow` (subtle static values), `background-color`, `border-color`, `color`.
- **Behavior:**
  - Hover: `translateY(-2px)` + slight contrast/glow enhancement.
  - Active: `translateY(1px)` quick snap.
  - Focus-visible: clear ring (`2px`) + offset.
- **Timing:** hover/focus `220ms var(--motion-ease-standard)`, active `120ms`.
- **Mobile:** no hover dependency; apply active/tap feedback and focus-visible.
- **Accessibility:** maintain default semantics; ring always visible for keyboard users.

## B) Nav links + mobile menu
- **Trigger:** hover/focus/active route; menu open/close.
- **Animated properties:** underline scale/position (via pseudo-element), text color, background pill opacity.
- **Behavior:**
  - Desktop: underline slide-in (left→right) or pill fade/scale.
  - Current page/section: persistent active style (already present).
  - Mobile Sheet: smooth slide/fade (already via Radix classes) standardized to emphasis duration/ease.
- **Timing:** link `180–220ms`; menu open/close `320–360ms`.
- **Mobile:** avoid tiny moving targets; keep stable tap area.
- **Accessibility:** preserve aria labels and current active state semantics.

## C) Cards (services, shows, sponsors)
- **Trigger:** hover/focus-within/tap.
- **Animated properties:** `transform`, `opacity`, `border-color`; optional child image scale.
- **Behavior:**
  - Hover/focus-within: card `translateY(-4px)` max + border accent.
  - Child media: scale `1.02` (max `1.04`) with slow ease.
  - CTA reveal: opacity + small translateY.
  - Tap: `translateY(1px)` micro response.
- **Timing:** card move `220ms`; image scale `320ms`; CTA reveal `180ms`.
- **Mobile:** disable hover-only reveals; keep CTA always visible or visible on focus/tap.
- **Accessibility:** focus-within mirrors hover behavior for keyboard parity.

## D) Photos / galleries / headshots
- **Trigger:** hover/focus/tap; lightbox open/close (if introduced later).
- **Animated properties:** `transform: scale`, overlay `opacity`, caption `opacity/translateY`.
- **Behavior:**
  - Hover: image scale `1.02–1.05`, dark gradient overlay + caption fade up.
  - Headshots: keep current overlay approach but reduce scale extremes to avoid distraction.
  - Lightbox (future): fade + slight scale (0.98→1).
- **Timing:** image `320–420ms`, caption `180–220ms`.
- **Mobile:** no hover assumptions; caption visible by default or toggle on tap.
- **Performance note:** continue lazy loading; add `srcset/sizes` where feasible.

## E) Section reveals (scroll)
- **Trigger:** scroll into view.
- **Animated properties:** `opacity`, `transform: translateY`.
- **Behavior:**
  - Section headers: one reveal.
  - Grid/list items: stagger `80ms` default.
  - Distance: `8–16px` (recommend `12px`).
- **Timing:** `320–380ms`, emphasis easing.
- **Run frequency:** once per page load default.
- **Accessibility:** reduced motion disables translation/stagger.

## F) Forms
- **Trigger:** focus, validation, submit.
- **Animated properties:** border/ring color, subtle shadow opacity, shake transform (error only), spinner rotation.
- **Behavior:**
  - Focus: border/ring intensify.
  - Validation error: short horizontal shake (2–3 keyframes, ≤240ms) + color feedback.
  - Submit: loading label + spinner, button disabled state.
- **Mobile:** keep input transitions short and non-distracting.
- **Accessibility:** error messaging remains text-based and ARIA-compatible; reduced motion removes shake.

---

## Phase 4 — Implementation approach (stack-aware)

## Recommendation for this repository
Because this project is **React + Vite + Tailwind with Framer Motion already in use**, use a **hybrid approach**:

1. **CSS-first for micro-interactions**
   - Centralize motion tokens in `client/src/index.css`.
   - Normalize shared UI primitives (`ui/button`, `ui/input`, card utility classes).
   - Keep hover/active/focus interactions in CSS utilities for speed and consistency.

2. **Framer Motion for section-level reveals and orchestration**
   - Keep Framer where already present.
   - Add shared `motionPresets` constants (e.g., `fadeUp`, `staggerContainer`, `staggerItem`) to avoid hardcoded per-component values.
   - Use Framer’s reduced-motion controls (`useReducedMotion`) in reusable wrappers.

3. **IntersectionObserver only when lightweight and library-free is better**
   - For non-Framer components/pages, provide a small IO hook that toggles `is-revealed` classes.
   - Keep observer thresholds/margins standardized.

4. **Do not add a new animation library**
   - Framer is already present and sufficient.
   - Avoid additional dependencies to protect performance and bundle size.

---

## Phase 5 — Deliverables

## 1) Motion spec doc (tokens + behaviors)
- This document is the baseline spec.
- Suggested next step: copy key token table into `docs/design-system-motion.md` (or design handbook) and enforce through component PR review.

## 2) Component checklist (what to animate, where)

- [ ] **Buttons:** unify hover/active/focus in `ui/button.tsx`; remove one-off custom hover scales where possible.
- [ ] **Nav links:** implement shared underline/pill motion classes in `Navbar` and footer nav links.
- [ ] **Cards:** standardize card lift/image zoom/CTA reveal for Services, UpcomingShows, Comedians, sponsorship/service cards.
- [ ] **Photos:** standardize overlay/caption timing for headshots/media/merch images.
- [ ] **Section reveals:** replace ad hoc reveal values with shared presets.
- [ ] **Forms:** unify input focus, invalid state, and submit loading interaction across Contact/Services/Book/Sponsorship/Comic forms.
- [ ] **Reduced motion:** apply one global media query plus JS hooks for Framer loops/scroll animations.

## 3) Pseudocode / stack-appropriate snippets

### A. `prefers-reduced-motion` baseline
```css
/* client/src/index.css */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 1ms !important;
    scroll-behavior: auto !important;
  }

  .motion-allow-transform {
    transform: none !important;
  }
}
```

### B. Button hover/active/focus
```tsx
// ui/button.tsx class idea (conceptual)
"transition-[transform,background-color,border-color,color,box-shadow] duration-[var(--motion-duration-standard)] ease-[var(--motion-ease-standard)] \
hover:-translate-y-[2px] active:translate-y-px active:duration-[var(--motion-duration-micro)] \
focus-visible:ring-2 focus-visible:ring-ring/80 focus-visible:ring-offset-2"
```

### C. Card hover
```tsx
// card wrapper classes
"group transition-transform duration-[var(--motion-duration-standard)] ease-[var(--motion-ease-standard)] hover:-translate-y-1 focus-within:-translate-y-1"

// child image
"transition-transform duration-[var(--motion-duration-emphasis)] ease-[var(--motion-ease-emphasis)] group-hover:scale-[1.03] group-focus-within:scale-[1.03]"
```

### D. Scroll reveal with IntersectionObserver (if non-Framer usage)
```ts
// useReveal.ts
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target); // once per load
      }
    });
  },
  { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
);
```

```css
.reveal {
  opacity: 0;
  transform: translateY(var(--motion-reveal-y));
  transition:
    opacity var(--motion-duration-emphasis) var(--motion-ease-emphasis),
    transform var(--motion-duration-emphasis) var(--motion-ease-emphasis);
}
.reveal.is-revealed {
  opacity: 1;
  transform: translateY(0);
}
```

## 4) QA checklist

### Accessibility
- [ ] Keyboard only: all interactive controls reachable and visibly focused.
- [ ] Focus styles remain clear in dark UI and at 200% zoom.
- [ ] `prefers-reduced-motion` removes non-essential movement (especially loops, reveals, shake).
- [ ] Error states are readable without relying on animation.

### Mobile/touch
- [ ] Tap targets ≥44×44 where practical.
- [ ] No hover-only critical actions.
- [ ] Motion feels responsive (<250ms for micro interactions).

### Performance
- [ ] Animate transform/opacity only for most effects.
- [ ] Avoid costly animated shadows/filters on large elements.
- [ ] Ensure images use lazy loading where below fold and include proper sizing.
- [ ] Lighthouse checks: no major regressions in Performance, Accessibility, Best Practices.

### Visual consistency
- [ ] Shared durations/easing used across all major components.
- [ ] Similar component types behave similarly across pages.
- [ ] Motion feels “premium + subtle,” not playful/gimmicky.

---

## Suggested rollout order (low-risk)
1. Introduce global motion tokens + reduced-motion baseline.
2. Normalize `ui/button`, `ui/input`, and a reusable `motion-card` utility.
3. Standardize Navbar + card interactions.
4. Consolidate section reveal presets (Framer constants or IO hook).
5. Sweep all forms for consistent focus/error/submit behavior.
6. Run accessibility + performance QA on desktop and mobile breakpoints.
