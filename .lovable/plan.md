
# Modernization plan — Postics UI

Goal: lift the product from "competent editorial" to current-2026 SaaS polish, without breaking the established editorial/greenhouse identity (Fraunces + Inter, paper + ink-green, sparing gold).

## What's good today (keep)
- Strong type system (display serif + neutral sans + mono numbers).
- Restrained color: paper, ink, single brand green, gold reserved for "verified/premium".
- Dark mode + i18n already in place.
- Real layout primitives (BrowserFrame, StatusChip, CreditMeter).

## What's behind modern best-practice (fix)

### 1. Depth & surface system
Current cards are flat 1px borders only. Modern SaaS (Linear, Vercel, Stripe, Resend) layers:
- elevated surface (subtle shadow), inset surface (sunken), and a top "glass" surface for sticky nav.
- 1px hairline border + tiny inner highlight on top edge in dark mode.

Add tokens: `--shadow-sm`, `--shadow-md`, `--shadow-pop`, `--ring-soft`, plus a `glass` utility (`backdrop-blur` + translucent surface + hairline).

### 2. Hero — current is text-heavy, no live artifact
Modern landing heroes pair the headline with a real product surface (animated, not a static screenshot). Plan:
- Asymmetric hero: left = headline + sub + dual CTA + trust row (logos + rating). Right = `BrowserFrame` showing a looping micro-demo of the Editor with the caret-blink utility and a streaming "AI draft" line.
- Add a thin "what's new" pill above H1 ("New · Freelancer Marketplace →") linking to /marketplace.

### 3. Nav — add command-bar affordance + scroll states
- Add a `⌘K` pill inside nav (visual only on landing, real in app shell).
- Shrink nav height + tighten shadow when scrolled (`data-scrolled`).
- Active section underline that follows scroll.

### 4. Section rhythm
Currently every section is the same vertical pad and width. Improve:
- Alternate full-bleed bands (Pillars, Differentiation) vs centered narrow (FAQ, CTA).
- Add `eyebrow` kicker + serif H2 + muted lede consistently (already have `SectionTitle` — apply everywhere).
- Generous `py-24 md:py-32` on bands, `py-16` on dense sections.

### 5. Pricing — make the recommended tier obvious
- Lift recommended card with `--shadow-pop`, gold hairline, "Most chosen" gold chip.
- Annual/monthly toggle with savings badge.
- Per-feature row hover highlight.

### 6. Marketplace cards — credibility cues
- Add micro-sparkline of "last 30d jobs" under rating.
- Verified gold badge with `ShieldCheck` icon + tooltip "Vetted by LetoLab".
- Skeleton state (shimmer) for loading.
- Sticky filter rail on desktop; bottom-sheet on mobile.

### 7. App shell topbar density
- Currently 9+ items in the topbar — overflows on 1280px. Move credit meter + "2 generating" into a single "Status" popover.
- Replace bell button + avatar block with a compact cluster (avatar opens menu with notifications inside).
- Search becomes a real `⌘K` command palette trigger (kbd shortcut listener).

### 8. Motion (subtle, not flashy)
- `animate-rise` on section enter via IntersectionObserver (already have keyframes).
- Hover lift on cards: `translateY(-2px)` + shadow upgrade.
- Tabular numbers animate on change (CreditMeter, ratings).
- Respect `prefers-reduced-motion`.

### 9. Accessibility & polish
- Focus ring: switch to 2px brand-500 offset ring on all interactive elements (currently 1px ring on buttons only).
- Min target size 40px for nav links on mobile.
- Color-contrast pass on dark mode `muted-foreground` (#8A8E96 on #161B22 ≈ 4.3 — borderline; bump to #9AA0A8).
- `prefers-reduced-transparency` fallback for glass nav.

### 10. Iconography & detail
- Standardize Lucide stroke at 1.5 everywhere (already mostly done, audit and enforce).
- Replace generic `Sparkle` in hero pill with a custom 2-tone mark for "AI".
- Add a tiny noise/grain texture on `--paper` (1% opacity) — gives the warm paper feel real depth.

## Proposed delivery order
1. **Foundations** — shadow tokens, glass utility, focus ring, grain texture, reduced-motion guard. (src/styles.css)
2. **Nav + Hero** — scrolled state, ⌘K pill, asymmetric hero with live editor frame. (Landing.tsx)
3. **Section rhythm + Pricing** — SectionTitle everywhere, annual toggle, recommended lift.
4. **AppShell topbar** — Status popover, avatar menu, ⌘K palette trigger.
5. **Marketplace** — sparkline, skeleton, sticky filters, gold verified tooltip.
6. **Motion + a11y polish pass.**

Each step is independent and ships behind no flags — pure presentation changes, no business logic.

## Open questions before I build
1. Scope: do all 6 steps, or start with **(1) Foundations + (2) Nav/Hero + (3) Section rhythm** as a first visible pass and review before going deeper?
2. Hero right-side: animated Editor mock (recommended) or a still BrowserFrame screenshot?
3. Keep gold strictly for "verified/premium/buy-site" moments, or also use it on the recommended pricing tier?
