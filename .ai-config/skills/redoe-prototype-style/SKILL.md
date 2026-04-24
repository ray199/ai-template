---
name: redoe-prototype-style
description: "Produce high-fidelity HTML interaction prototypes in the Redoe OS visual language — manufacturing-grade information density, Linear/Plane/Stripe aesthetic, navy + monochrome palette, Inter + JetBrains Mono typography, 8px grid, 1280×820 app frame with presentation tabs. Use whenever the user asks for a prototype, mockup, wireframe, HTML screen design, Redoe-style dashboard, shop-floor kiosk UI, or any multi-screen clickable HTML concept for industrial/operations software. Also use when a user uploads or references an app that should be redesigned in the Redoe style."
---

# Redoe-Style Interaction Prototype

Turn a feature idea into a polished, self-contained HTML prototype that looks and feels like Redoe OS — a manufacturing operations product with Linear-grade information density, Plane's layered depth, and Stripe's KPI restraint.

This skill encodes the visual grammar extracted from `development-pack-main`: the design tokens, sidebar pattern, presentation bar, typography rules, and anti-slop gates that make Redoe screens recognizable at a glance.

## When to use

- "Design a prototype / mockup / wireframe for …"
- "Draft a Redoe-style screen for …"
- "Make me an HTML mockup of a dashboard / pipeline board / job detail / shop-floor kiosk"
- "Explore 2–3 visual variants for this page"
- "Redesign this screen to look like a manufacturing OS"

Do **not** use for: production React/Vue code (this skill outputs HTML prototypes, not shippable app code), plain documents, spreadsheets, or branded marketing pages.

## Output contract

Every invocation produces a single self-contained `.html` file in the workspace with:

1. A **presentation bar** (Redoe Navy, 40px tall, sticky top) containing a small brand mark, a feature label, and a tab group for switching between 2–5 screens.
2. A **1280 × 820 app frame** centered on a warm off-white canvas (`#EDECEA`), with a soft shadow and `border-radius: 12px`, mimicking a Vercel preview card.
3. A **240px left sidebar** grouped into labeled sections with Lucide-style SVG icons, plus a footer avatar card.
4. A **main content area** with a compact page header (breadcrumb + 18px bold title + right-aligned action buttons), followed by content blocks laid out on an 8px grid.
5. **Screen switching** wired up via a `show(i)` function and `.scr.on` CSS.
6. Google Fonts preloaded: `Inter` (400/500/600/700) and `JetBrains Mono` (400/500).

Start from the template at `mockup-template.html` in this skill folder. Copy it, rename screens, and fill the `.cb` body.

## Required workflow

### Step 1 — Clarify before drawing

Ask at most 2 rounds of questions:

- **Who** uses this screen? Tier 1 shop-floor operator (gloves, kiosk, 56px targets, no sidebar, no financial data) / Tier 2 management (sidebar + Cmd+K) / Tier 3 admin (settings two-column).
- **What job** does the screen do, in a verb? ("approve time entries", "spot late jobs", "claim a work order")
- **What comes before / after** it in the flow?
- **How many screens** in the prototype? Default 2. Max 5.

If the request is vague ("make a dashboard"), propose a concrete job-to-be-done before coding.

### Step 2 — Pick a page archetype

Match the job to one of six canonical archetypes. Do not invent new layouts:

| Archetype | When to use | Anatomy |
|---|---|---|
| Dashboard | "at-a-glance status" | KPI strip (3–4 cards) → filter bar → chart → table |
| List | "browse / filter / find" | page header → filter toolbar → data table → pagination |
| Detail | "dig into one record" | header + status → tabs (Overview / Details / Documents / History) |
| Form | "create / edit" | centered form `max-w-2xl` → sticky footer (Cancel + Submit) |
| Settings | "configure" | 220px section nav → content column (max-w-3xl) → save per section |
| Split view | "list + detail inbox" | 320px list panel + flex-1 detail panel |
| Shop Floor | Tier 1 only | no sidebar, full-screen, 3 screens max: Select → Act → Confirm |

### Step 3 — Respect the design tokens

All colors, fonts, and spacing come from this closed set. Never improvise, never hardcode hex outside these tokens.

```css
/* Brand */
--navy:#1F4E79;  --blue:#2E75B6;  --light:#D6E4F0;

/* Surfaces */
--canvas:#EDECEA (body bg);  --surface-1:#FFFFFF;  --surface-2:#F9FAFB;
--border:#E5E7EB;  --text:#0F172A;  --muted:#6B7280;

/* Status (always color + icon + text — never color alone) */
--green:#22C55E  healthy / on-track
--amber:#F59E0B  pending / needs action    ← "pending" is AMBER, never blue
--red:#EF4444    blocked / over-budget
--info:#38BDF8   informational
--neutral:#94A3B8 on-hold / inactive

/* Entity accents (for multi-site tags) */
Windsor #2563EB · Hunan #7C3AED · PES #EA580C · Pangeo #6B7280 · GTA #0891B2 · IPO #DB2777

/* Motion */
--dur-fast:150ms;  --dur-normal:200ms;
--ease-out:cubic-bezier(.25,1,.5,1);
```

Typography — max **4 sizes + 3 weights** on any one screen:

| Class | Size | Font | Use |
|---|---|---|---|
| page title | 18–20px / 700 | Inter | page header `.pt` |
| heading-md | 15–16px / 600 | Inter | card titles |
| body | 13px / 400 | Inter | default prose, table cells |
| body-sm / caption | 11–12px | Inter | labels, breadcrumbs |
| KPI hero | 28–32px / 500 | JetBrains Mono | hero numbers, tabular-nums |
| data | 13px / 400 | JetBrains Mono | job IDs (G-1234), timestamps, currency |

Spacing: strict 8px grid. `4px` only for icon-to-label gaps. Radius: `6px` buttons, `8–12px` cards, `9999px` badges.

### Step 4 — Use real manufacturing data

Never ship lorem ipsum or emoji placeholders. Use the Redoe vocabulary:

- Job numbers: `G-8232`, `G-1045`, `G-2188` (mono + muted color)
- Operations: "CNC Housing", "HPDC Press 3", "Mold Polishing", "QC Inspection"
- People: short initials in circular avatars — `SP` (Steve Pan), `AK`, `BW`
- Entities: Redoe Windsor, Redoe Hunan, PES, Pangeo Corp
- Statuses: Active, At Risk, Over Budget, Complete, On Hold, Needs Approval
- Timestamps: `Mar 24, 14:32` in mono; relative times ("3h ago") in plain Inter

### Step 5 — Compose content blocks from the recipe library

Pick blocks straight from this menu. Do not reinvent.

- **KPI strip.** 3–4 borderless cards in a grid. Each card: 10px uppercase label (muted), 28px mono hero number, 11px delta with ↑ green / ↓ red. Hero number is the visual anchor — never put borders or background on the card.
- **Filter bar.** `flex-nowrap`, one row only. Left: date range pill, active-filter pills (`#EFF6FF` bg, `#BFDBFE` border, small × chip). Right: view switcher (bordered segmented control, active tab `#EFF6FF` + blue text).
- **Data table.** 44px rows, `font-data` + right-align on numbers, `tabular-nums`. Header: `surface-2` bg, 10px uppercase muted labels. Hover row: `#FAFAFA`. Always include a footer bar with row count + pagination.
- **Status badge.** Pill, 11px/600, 9px horizontal pad. `sbdg-g` green, `sbdg-a` amber, `sbdg-r` red. Optional status dot variant (8px circle) when space is tight.
- **Empty state.** Centered: 48px outlined Lucide icon (`--muted` at 40% alpha) → 15px/500 heading → 13px muted description → primary button with verb + noun.
- **Detail sheet.** 480px right-slide panel for read-only detail, 640px for edit. Never inline-expand a table row.
- **Page header.** 52px tall, `border-bottom`. Breadcrumb (12px muted) stacked over 18px/700 page title. Right side: `.btn-p` primary + optional `.btn-o` outline.
- **Segmented control (universal).** A 30px tall tray on `surface-2` with a `border` and `gap-[1px]`. Active child lifts to `surface-1` with a faint shadow. Used for every "group of mutually-exclusive pills" — status tabs, date range, view toggle. Never use a filled navy pill as the active state.

### Step 6 — Anti-slop forcing gates (run BEFORE saving)

Reject and regenerate if any of these are true:

1. **Memorability test.** Name one specific element that is memorable on this screen. "Clean and professional" does not count. If the answer is generic ("the table"), add a signature detail — a pulsing status dot, a mono job number anchored to the left rail, an amber "Needs approval" chip that stands out.
2. **3-axis differentiation** (when generating variants): each variant must differ from the others on **font OR weight-hierarchy**, **color strategy** (mono vs navy-accent vs full-status-color), **and** **layout** (table vs cards vs split-pane vs timeline). If two variants share ≥ 2 axes, scrap one.
3. **Slop blacklist.** Hard reject — regenerate if present:
   - Purple/violet gradients as primary scheme
   - Glassmorphism anywhere outside a single management accent
   - Four equal stat cards with centered icons and generic labels
   - Circular progress dial as the main viz
   - Stock illustrations, shrug emoji, "Welcome back, User" greeting
   - Container `border-radius > 12px`
   - Rainbow status colors outside the green/amber/red/info/neutral set
   - Hardcoded hex in the `.cb` body (must use CSS variables)
   - Spinners (use skeleton shimmer instead)
   - Colored icons in the sidebar (monochrome only)
   - `<select>` native dropdowns (use Command-style search)
   - Blue badges for "pending / needs action" (pending is **amber**)
4. **Embarrassment gate.** Would a senior product designer put this in their portfolio? If it's indistinguishable from a generic shadcn dashboard template, iterate.

### Step 7 — Deliver

Save the HTML to `E:\workspace\<feature-slug>-mockup.html`. Return a short summary:

- One sentence on the user job captured
- A bulleted list of the screens included (1 sentence each)
- A `computer://` link to the file

If the user asked for variants, produce one HTML file per variant plus a `comparison.html` that embeds each variant in a side-by-side iframe grid with Variant A / B / C labels and a Grid / Single toggle.

## Tier-specific overrides

**Shop Floor (Tier 1) — operator kiosk:**
- Remove the sidebar entirely; content fills the frame.
- Primary buttons `56px` tall, full-width, verb-first labels.
- WCAG AAA contrast (`7:1`). Body text 16px minimum.
- Never display financial data (no cost, margin, or revenue columns).
- Three-screen maximum: Select → Act → Confirm.
- No hover-only affordances (touchscreens).

**Management (Tier 2) — desktop:**
- Default. Full sidebar, Cmd+K search in header, keyboard shortcut hints on primary buttons.
- Detail views use a tab strip (Overview / Details / Documents / History).

**Admin (Tier 3) — settings:**
- Two-column settings layout: 220px nav + content.
- Show API keys, audit logs, role matrices.
- Save-per-section footer bar on each settings page.

## Template

The reference template lives at `mockup-template.html` alongside this SKILL.md. It provides the presentation bar, 1280×820 app frame, full sidebar with 6 nav groups and Lucide SVG icons injected via JS, page header, button / KPI / filter / view-switcher / table / badge / modal / save-bar components, and a `show(i)` screen-switch function.

To use it:

1. Copy `mockup-template.html` to `E:\workspace\<slug>-mockup.html`.
2. Update the `.pbar` brand label and `.pbar-ctx` feature description.
3. Add a `<button class="stab">` tab for each screen and a matching `<div class="scr">` block.
4. Set `data-sb="<key>"` on each sidebar so the correct nav item highlights. Valid keys: `dashboard`, `inbox`, `alljobs`, `pipeline`, `schedule`, `employees`, `timeclock`, `timeanalytics`, `timeapproval`, `machines`, `quality`, `jobcosting`, `reports`, `settings`.
5. Fill the `.cb` content area using only the recipe blocks above.
6. Run the anti-slop gates before saving.

## Self-check before returning

- [ ] All colors come from CSS variables (no raw hex in `.cb`).
- [ ] Exactly one primary CTA per header (`.btn-p`).
- [ ] Numbers, IDs, and timestamps use `.mono` / JetBrains Mono.
- [ ] 8px spacing rhythm (padding, gaps all divisible by 8, except 4px icon-to-label).
- [ ] Status always = color + icon + text.
- [ ] Pending / needs-action items are amber, never blue.
- [ ] Empty states have icon + heading + description + CTA (no shrug emoji).
- [ ] Touch targets ≥ 44px (≥ 56px for shop floor).
- [ ] No financial data on shop-floor screens.
- [ ] Every screen has one genuinely memorable element (not just "clean").
- [ ] Variants, if any, pass the 3-axis differentiation check.
