# WakeCore

> Category: Professional & Corporate
> WakeCap's governed operations design system — restrained, near-monochrome, data-first. You COMPOSE from a governed catalog; you do not invent UI.

<!--
  Phase 4 of the "WakeCore as the brain" mission. This is the Open Design design-system
  contract for WakeCore (@wakecap/core-ui). It is injected verbatim into every generation.
  It is authoritative for color, typography, spacing, and component rules.
  Companion (Phase 6): tokens.css (this :root, split out), manifest.json, USAGE.md, components.html,
  and the WakeCore MCP server (the live SDK: resolveTemplate / resolveWidgets / validateComposition).
  Optimized for an LLM: rules over prose, tables, imperatives.
-->

## 1. Visual Theme & Atmosphere

WakeCore is the design system of **WakeCap** — software for the physical worksite (construction, workforce, safety, operations). Its character: **calm, dense, precise, trustworthy.** A control-room aesthetic, not a marketing site. Neutral surfaces, near-black actions, one warm accent reserved for data. Restraint is the brand.

**This is a GOVERNED system. The single most important rule:**

> **Compose from the WakeCore catalog. Do not invent.** Every screen is a **template** (a page layout of regions) filled with **widgets** (configurable domain units) built from **components** (primitives). You select and assemble these; you never design new components, new layouts, or off-catalog UI. When unsure what exists or what fits, **consult the WakeCore MCP** (`wakecore_resolve_template`, `wakecore_resolve_widgets`, `wakecore_resolve_component`) — it is the source of truth. Validate with `wakecore_validate_composition` before you consider anything done. The deliverable is a **PageInstance**, which is then rendered — not hand-written UI.

The tiers you compose with (low → high):

| Tier          | What it is                                                     | Examples                                            |
| ------------- | -------------------------------------------------------------- | --------------------------------------------------- |
| **Component** | Generic primitive, no domain meaning                           | Button, Input, Card, Badge, Table, Dialog           |
| **Widget**    | Configurable, domain-meaningful unit (config + data contract)  | KPIBar, MetricCard, DataTable, Map, ProjectList     |
| **Template**  | A whole page = widgets arranged in **regions**, with data flow | Regular Dashboard, Detail, LoginPage                |
| **Pattern**   | Cross-cutting rule (not an artifact)                           | "dashboards lead with KPIs", "destructive confirms" |

Atmosphere in one line: **white/neutral canvas, hairline borders, dark primary actions, monospace numerics, amber only for data — nothing shouts.**

## 2. Color

Palette philosophy: **90% neutral, dark near-black as the action color, ONE warm accent (amber) reserved exclusively for data/emphasis, red for danger.** There is no bright brand hue. **Never introduce indigo/violet/blue gradients or any color not in this `:root`.** Paste this `:root` block verbatim into the artifact's first `<style>`; do not invent or redefine tokens; do not write raw hex outside it.

```css
:root {
	/* — A1 identity (the brand IS these) — */
	--bg: #ffffff;
	--surface: #fafafa; /* cards, raised sections */
	--fg: #1c1c1c; /* primary text */
	--muted: #737373; /* secondary text / meta */
	--border: #e6e6e6; /* hairline dividers */
	--accent: #292929; /* PRIMARY ACTION — near-black, not a color */
	--font-display: "Figtree", ui-sans-serif, system-ui, sans-serif;
	--font-body: "Figtree", ui-sans-serif, system-ui, sans-serif;

	/* — A1 structure — */
	--text-xs: 0.75rem;
	--text-sm: 0.875rem;
	--text-base: 1rem;
	--text-lg: 1.125rem;
	--text-xl: 1.25rem;
	--text-2xl: 1.5rem;
	--text-3xl: 1.875rem;
	--text-4xl: 2.25rem;
	--leading-body: 1.6;
	--leading-tight: 1.2;
	--tracking-display: -0.02em;
	--section-y-desktop: 80px;
	--section-y-tablet: 56px;
	--section-y-phone: 40px;
	--container-max: 1280px;
	--container-gutter-desktop: 32px;
	--container-gutter-phone: 16px;

	/* — A2 (functional; keep all present) — */
	--accent-on: #ffffff; /* text on --accent */
	--accent-hover: #1f1f1f;
	--accent-active: #141414;
	--success: #16a34a;
	--warn: #b45309;
	--danger: #d92d20; /* destructive */
	--font-mono: "IBM Plex Mono", ui-monospace, monospace; /* ALL numerics, IDs, metrics */
	--space-1: 4px;
	--space-2: 8px;
	--space-3: 12px;
	--space-4: 16px;
	--space-5: 20px;
	--space-6: 24px;
	--space-7: 32px;
	--space-8: 40px;
	--space-9: 48px;
	--space-10: 64px;
	--space-11: 80px;
	--space-12: 96px;
	--radius-sm: 6px;
	--radius-md: 8px;
	--radius-lg: 10px;
	--radius-pill: 9999px;
	--elev-flat: none;
	--elev-ring: 0 0 0 1px rgba(0, 0, 0, 0.06);
	--elev-raised: 0 1px 2px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.06);
	--focus-ring: 0 0 0 2px rgba(41, 41, 41, 0.45);
	--motion-fast: 120ms;
	--motion-base: 200ms;
	--ease-standard: cubic-bezier(0.2, 0, 0, 1);

	/* — B slots (may equal a sibling) — */
	--surface-warm: #fafafa;
	--fg-2: #404040;
	--meta: #737373;
	--border-soft: #efefef;

	/* — C extensions (WakeCore-only; warm data accent + status dots + chart ramp) — */
	--wc-warm: #b86010; /* the ONE warm accent — data emphasis ONLY, never chrome */
	--wc-warm-soft: #f5ece1;
	--wc-dot-success: #16a34a;
	--wc-dot-warn: #b45309;
	--wc-dot-danger: #d92d20;
	--chart-1: #ecd7b8;
	--chart-2: #e0b483;
	--chart-3: #cf8f4e;
	--chart-4: #bd6c22;
	--chart-5: #a5510f;
}
[data-theme="dark"] {
	--bg: #1c1c1c;
	--surface: #242424;
	--fg: #fafafa;
	--muted: #a3a3a3;
	--border: #333333;
	--accent: #fafafa;
	--accent-on: #1c1c1c;
	--accent-hover: #ececec;
	--accent-active: #dcdcdc;
	--surface-warm: #242424;
	--fg-2: #d4d4d4;
	--meta: #a3a3a3;
	--border-soft: #2b2b2b;
}
```

**Color rules (hard):**

- **`--accent` is near-black.** Primary buttons and key affordances use it. It is the "one accent" — do not add a second.
- **`--wc-warm` (amber) is for DATA ONLY** — chart lines, a highlighted metric, a trend arrow. Never for buttons, links, backgrounds, or chrome. ≤2 warm uses per screen.
- **Status = dots/badges, not fills.** Use `--wc-dot-*` for on-track/at-risk/critical. Reserve `--danger` for destructive actions and error states.
- **Contrast:** body text ≥ 4.5:1, large/UI ≥ 3:1. Never gray-on-gray below `--muted`.
- **Forbidden:** indigo `#6366f1`, blue→cyan/violet gradients, neon, more than one accent, raw hex outside `:root`, color to carry meaning without a label.

## 3. Typography

Three families, all real: **Figtree** (display + body — humanist, quiet), **Lora** (serif, rare — long-form editorial only), **IBM Plex Mono** (all numerics, IDs, metrics, code). Numbers are data — they are ALWAYS mono and tabular.

```
Font labels for catalog extraction
Display: Figtree — "Figtree", ui-sans-serif, system-ui, sans-serif
Body:    Figtree — "Figtree", ui-sans-serif, system-ui, sans-serif
Mono:    IBM Plex Mono — "IBM Plex Mono", ui-monospace, monospace
```

**Scale & rules:** use the `--text-*` ramp; page title `--text-2xl`/`3xl` `--tracking-display`; section headers `--text-lg`/`xl` semibold; body `--text-sm`/`base` `--leading-body`; meta/labels `--text-xs` `--muted` uppercase-tracking for eyebrows only. **Every metric/count/ID uses `--font-mono` with `font-variant-numeric: tabular-nums`.** One display face per screen. No more than 3 sizes visible in a dense view. Never center long-form body.

## 4. Spacing

An 4px base rhythm (`--space-1`=4 … `--space-12`=96). Density is the brand — WakeCore screens are information-dense but never cramped.

- Component padding: `--space-3`/`--space-4`. Card padding: `--space-4`/`--space-5`.
- Between fields: `--space-4`. Between sections: `--space-7`/`--space-8`. Page vertical rhythm: `--section-y-*`.
- Tables/lists: row padding `--space-2`/`--space-3`; keep rows tight for scanability.
- Gutters: `--container-gutter-desktop` (32) / `--container-gutter-phone` (16); content max `--container-max` (1280).
- **Rule:** use the scale, never arbitrary px. Consistent rhythm > generous whitespace. Align to an 8px grid.

## 5. Layout & Composition

**The template IS the layout. You do not invent layout — you fill a template's regions.** Ask the WakeCore MCP (`wakecore_resolve_template`) for the right template, then fill each region with the widgets it declares (`wakecore_resolve_widgets`).

- **App shell:** most pages sit inside `CoreAppSidebar` + `CoreAppTopBar` + `CoreContentArea`. Sign-in/error pages are bare (no shell).
- **Regions** are named slots with rules (required/optional, allowed widgets, cardinality). Fill required regions; respect min/max; place declared widgets first.
- **Responsive:** desktop-first, graceful collapse. Sidebars collapse; multi-column grids → 2-col → 1-col; the app shell owns the frame. Breakpoints ~ 768 / 1024 / 1280.
- **Composition rules:** lead with the highest-signal region (dashboards → KPI strip first, then list/map/detail). One primary action per view. Don't nest scroll containers. Don't place a widget in a region its manifest doesn't allow — validation will reject it.

Representative template shapes (resolve the live set via the MCP):

| Template                            | Shape                                                                              |
| ----------------------------------- | ---------------------------------------------------------------------------------- |
| **Dashboard** (Org Overview)        | KPI strip (top) · searchable list (left) · map (fills) · detail panel              |
| **Detail** (e.g. Quality Issues)    | entity header · optional KPI strip · tabbed section cards                          |
| **Regular Dashboard** (Performance) | filter strip · KPI tiles · charts · addable widgets                                |
| **LoginPage**                       | split-screen: brand panel (2/3) · form column (1/3): heading + form + legal footer |

## 6. Components

The catalog is tiered. **Prefer catalog entries over inventing shapes.** Query the MCP for the authoritative inventory, variants, config, and data contracts (`wakecore_resolve_component`, `wakecore_resolve_widgets`, `wakecore_load_manifest`).

**Primitives (components):** Button, Input, Textarea, Select, Checkbox, RadioGroup, Switch, Toggle, Slider, Label, Badge, Avatar, Kbd, Spinner, Progress, Skeleton, Separator, Card, Table, DataTable, Tabs, Accordion, ScrollArea, Dialog, AlertDialog, Sheet, Drawer, Popover, Tooltip, DropdownMenu, Breadcrumb, Pagination, Command, Alert, Empty, Toast.

**Button variants (map intent → variant):**
| Variant | Use |
|---|---|
| `default` | Primary action — one per view (near-black) |
| `destructive` | Irreversible/dangerous (delete) |
| `outline` | Secondary beside a primary |
| `secondary` | Low-emphasis |
| `ghost` | Toolbar / icon buttons |
| `link` | Inline text action |

**Widgets (domain units):** KPIBar (compact stat row), KPISummary (metric card grid), MetricCard (single tile), TrendChart, DataTable, Map + MapControls, ProjectList, plus the full library — resolve per region.

**Component rules:** hairline borders (`--border`), radius `--radius-md`, `--elev-ring` at rest / `--elev-raised` on float. Cards on `--surface`. Inputs 36–40px tall, clear `:focus-visible` (`--focus-ring`). Icons: lucide, 16/20px, `--muted` unless active. Every interactive element has a hover, focus, disabled, and (where relevant) loading/empty/error state.

## 7. Motion & Interaction

Motion is functional and quiet. `--motion-fast` (120ms) for hovers/toggles, `--motion-base` (200ms) for panels/overlays, `--ease-standard`. Slide-in panels push content; overlays fade+scale subtly. **No decorative/looping animation, no parallax, no bounce.** Always `:focus-visible` rings; keyboard-operable everything. Respect `prefers-reduced-motion` — drop transforms, keep opacity. Optimistic feedback on actions; skeletons (not spinners) for content loads.

## 8. Voice & Brand

Professional, precise, operational. Copy is short and factual — labels, not marketing ("At risk", not "Uh-oh!"). Numbers lead; units are explicit ("342 on site", "72% complete"). Domain vocabulary: projects, zones, workforce, safety, schedule, NCRs, LTI. No emoji, no exclamation, no hype. Empty states state the fact + the next action. WakeCore sounds like a competent operator, not a chatbot.

## 9. Anti-patterns (do NOT)

- **Do NOT invent components, widgets, templates, or layouts.** Compose from the catalog; resolve via the MCP. If nothing fits, say so and ask.
- **Do NOT emit arbitrary React/HTML from imagination.** The output is a validated **PageInstance**; rendering is downstream.
- **Do NOT skip validation.** Run `wakecore_validate_composition`; a page is not done until it is `buildable`. Fix required-region/required-widget/placement/binding issues.
- **Do NOT invent tokens or write raw hex** outside the `:root`. No off-palette colors.
- **Do NOT use amber (`--wc-warm`) for chrome** — data emphasis only, ≤2 per screen. **No indigo, no gradients, no AI-slop palettes.**
- **Do NOT make numerics non-mono** or non-tabular. **Do NOT** center long body text or use more than one display face.
- **Do NOT place a widget in a region its manifest disallows**, exceed cardinality, or leave a required data input unbound.
- **Do NOT decorate.** No hero gradients, glassmorphism, drop-shadow stacks, or motion for its own sake. Restraint is correct.
