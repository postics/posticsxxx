## Goal

Rewrite `src/routes/dashboard.tsx` as a generate-first overview that lives inside `ProjectShell` (no custom sidebar/topbar) and treats publishing/measurement as optional add-ons that only appear when a store is connected. Strip every trace of "Vellum & Bean", `*.postics.site`, "Preview · noindex", "Open site", and the human-review/awaiting-approval framing.

## Scope

- Edit only `src/routes/dashboard.tsx`.
- Update demo project name to **Northbound Coffee Roasters** in `src/features/shell/scope.tsx` (rename the first project + its `id`/`domain`/`initials`; update `PROJECT_KEY` fallback handling so old localStorage values fall back to the new default). Other routes that reference the old id will still resolve via the fallback.

## Page structure (top to bottom)

1. **Local state**: `connected: boolean` (mock toggle in header so the two flows are demoable). Defaults to `false` (export mode).

2. **Store header**
   - Business name "Northbound Coffee Roasters" (display font).
   - If `connected`: mono slug `northboundcoffee.com` + `StatusChip tone="live"` "Connected". If not: muted "Not connected — export mode" chip + small ghost "Connect store" button.
   - Right side: plan badge "Growth · monthly" (gold for Premium not used here), output-language chips (EN · ES), and a small toggle "Demo: connected ⇄ export-only" so reviewers can flip states. No "Open site" button.

3. **Hero "Your content" panel** (primary card, generate-first)
   - Four mono counts in a row: **Generated 184**, **Ready to export 12**, **Exported 47**, and — only if `connected` — **Published 38**.
   - Two CTAs: primary `Generate next` (links to `/plan`), secondary `Export ready pieces` (opens a mock sheet link to `/plan` for now).
   - If `!connected`: quiet upsell card below the CTAs: "Connect your site or store to auto-publish & measure outcomes (optional)" with a ghost "Connect" button.
   - If `connected`: an "Outcomes" sub-strip listing 3 recently published items, each with an **outcome badge** reading `collecting — first signals in ~14–30 days` and a small arrow + caption "Outcomes feed your next Strategy →" linking to `/plan`.

4. **Cycle stepper (slim secondary strip)**
   - Horizontal pills: Analyze · Strategy · Generate · **Quality-gate (auto)** · Export · Publish (optional, muted when `!connected`) · Measure (muted when `!connected`).
   - Each pill shows a tiny mono count (e.g. Generate 12, Export 47). Display-only.

5. **Needs your attention**
   - Render only genuinely stuck items, deduced from mock counts: `2 failed to generate`, `1 failed quality gate`, plus (only if `connected`) `1 failed to publish`. Each is a card with a CTA to `/plan` filtered to that state.
   - If none, show calm empty state "Nothing stuck — keep generating." NO human-review/awaiting-approval cards.

6. **Pipeline mini-kanban**
   - Five columns with mono counts: Draft 6 · Generating 2 · Ready 12 · Published 38 (dimmed/zero when `!connected`) · Failed 3. Reuses the column-card pattern from current dashboard but matches the Plan board's five lanes.

7. **North Star mini-panel** (right-side card or below kanban)
   - Big mono "Pieces generated this week — 18" and "Ready this week — 9".
   - Muted line: `adherence — calibrating` (no % threshold).
   - **Catch Up** button rendered `disabled` with tooltip/caption "Scheduling activates after setup (M1)".

8. **Low credits soft banner**
   - Reuse current gold banner copy: "You're at 32% of monthly credits — generate-heavy weeks may run short" with a ghost "View plans" → `/billing`.

9. **Empty state**
   - If `generated === 0`: replace hero panel body with "Your strategy is ready — generate your first piece" + primary CTA "Generate first piece" → `/plan`. (Behind a `const isEmpty = false` toggle so reviewers see populated UI by default.)

## Things to remove

- Custom `Sidebar` and `TopBar` functions (use `ProjectShell` instead).
- "Site" nav reference, `Globe2` "Open site" button, `BrowserFrame` site preview block, `*.postics.site` link, `Preview · noindex` chip, `Sparkle` icon usage in CTAs.
- Activity feed (replaced by Outcomes strip + attention list — keeps the page focused on generate-first).
- Sparkline traffic/position cards (Analytics-only — dashboard stays generate-first).
- All "awaiting approval" / "in human-review" attention copy.

## Imports & wiring

- Wrap body in `<ProjectShell breadcrumb={[{ label: "Overview" }]}>`.
- Drop unused lucide icons; keep `Plus`, `ArrowRight`, `AlertTriangle`, `CheckCircle2`, `Clock`, `Download`, `Plug`, `RefreshCcw`, `Lock`.
- Keep `Card`, `StatusChip`, `SectionTitle` from `@/features/shared/primitives`.
- Update `head().meta.title` to `"Northbound Coffee Roasters — Postics"`.

## States covered

empty (no generated pieces) · populated export-only · populated connected · with-stuck-items · low-credits banner · scheduling disabled. All mock, no network calls.
