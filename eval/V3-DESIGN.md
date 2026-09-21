# Core eval V3 — composition & workflow benchmark (design)

> V1/V2 measured single-component decisions. V3 measures whether an agent can **assemble a
> whole screen / workflow correctly**, and grades on **behavior** (compiles, renders, a11y),
> not string presence. Design only — no enforcement, no CI gates, no `@core/validate`.

## Why V3

The single-component suite cannot exercise the **composition** layer (A3 = skill + `patterns[]`)
— there's nothing to compose. And structural graders pass code that doesn't compile. V3 fixes
both: realistic screens + behavioral grading. It reuses the same **A0–A4 ablation ladder**, so
we still get per-layer attribution — but now the A2→A3 (composition) lift finally has a surface
to show on.

## Grading model

Each task is graded on three tiers; a task "passes" only when all three hold.

1. **Structure** (AST/DOM relationships, not name-greps): required component *families* present,
   correct ordering/nesting, providers wired, shared state threaded. Expressed as assertions,
   e.g. `kpiCards.every(c => above(c, charts))`, `sidebar.requires(SidebarProvider)`.
2. **Behavior — `tsc` compile** (exists: `eval/graders/compile.mjs`): type-checks against the
   real built `@core/core-ui` types. `resolves` (imports/exports valid) and `compiles`
   (full type-check).
3. **Behavior — render + a11y** (new graders, reuse the repo's Vitest 4 + Playwright/Chromium):
   `render-smoke` (mounts, no throw, non-empty DOM) and `axe` (no critical/serious violations).

**Anti-leak rule (all tasks):** prompts describe a *user goal / behavior*, never a component
name. Graders assert *shape and behavior*, never component-name presence (fixing V2's
`component-choice` leak).

## New graders required (build order)

| Grader | Reuses | Effort | Notes |
| --- | --- | --- | --- |
| `tsc` compile | typescript (built) | ✅ done | wire into the ablation as a metric |
| composition-structure | TS AST (`ts` already a dep) | M | family presence + ordering/nesting/wiring assertions per task |
| render-smoke | Vitest browser + Chromium (present) | M | mount the snippet in a harness app, assert no throw |
| axe-a11y | axe-core + Chromium | M | run on the rendered output |

## Task set (9 full-screen / workflow tasks)

Each: **prompt** (goal-framed), **success criteria**, **measurable rules**, **fm coverage**.

### 1. Dashboard page composition
- **Prompt:** "Build an org overview landing page: key metrics summarized at the top, trend
  visualizations below, and a loading state while data is fetching."
- **Success:** KPI summaries across the top, trend panels beneath, skeleton/loading present.
- **Rules:** card-family ≥3 ∧ chart-family ≥1 ∧ skeleton-family ≥1; KPIs ordered above charts
  (DOM order); compiles; renders; no axe-critical.
- **fm:** chart-1 (ChartContainer not raw ECharts), chart-3 (pie keys).

### 2. Template gallery workflow
- **Prompt:** "From a 'New from template' action, open a searchable gallery of templates in a
  focused overlay; selecting one previews its details before the user confirms."
- **Success:** trigger → focused overlay → searchable card grid → preview → confirm.
- **Rules:** overlay-family ∧ search-family ∧ card-grid; focus is trapped in the overlay;
  confirm action present; renders; axe focus-order passes.
- **fm:** prim-5 (wwc: prefix on any utility classes).

### 3. Multi-step form workflow
- **Prompt:** "A 3-step 'create project' flow — details, then team members, then review —
  with visible progress, validation on each step, and back/next navigation."
- **Success:** stepper/progress + per-step fields + validation + back/next + review.
- **Rules:** stepper/progress-family ∧ form-family per step ∧ FormItem wraps FormControl ∧
  inline messages; step state threaded; compiles (typed submit); renders.
- **fm:** form-1 (FormControl in FormItem), form-2 (fields under Form), form-3 (import Form*
  from core-ui, not react-hook-form).

### 4. Data-heavy admin screen
- **Prompt:** "An admin screen listing thousands of records with column sorting, text filtering,
  pagination, and a row → detail panel — plus a filter strip that scopes the list."
- **Success:** rich data grid (not a plain table) + filter strip + detail panel, all wired.
- **Rules:** data-grid-family (not Table) ∧ search bound to a real column id ∧ exactly one of
  getSubRows / renderSubComponent ∧ filter-family scoping the grid via shared state; compiles.
- **fm:** dt-1 (searchKey matches a column id), dt-2 (getRowCanExpand), dt-3 (subRows xor
  detail panel).

### 5. Chat workflow
- **Prompt:** "An AI assistant panel: a prompt input, a streamed message list, a thinking/tool-
  call indicator, and the ability to render a chart inside an assistant message."
- **Success:** prompt input + message list + thinking/tool-call state + in-message chart.
- **Rules:** chat-family ∧ message prop shape matches the message type ∧ in-message chart uses
  the chat chart renderer (not raw ECharts); compiles; renders.
- **fm:** chat-1 (replace mock service), chat-2 (message.chart vs chartData), chat-3 (pie keys),
  chart-1.

### 6. Navigation & app-shell composition
- **Prompt:** "Lay out the authenticated app shell: a collapsible left nav, a top bar with
  breadcrumb and an org/project switcher, and section tabs over the main content."
- **Success:** sidebar + top bar + breadcrumb + switcher + tabs, correctly nested.
- **Rules:** sidebar-family ∧ SidebarProvider at root ∧ exactly one nav landmark ∧ `<main>`
  sibling ∧ tabs switch panels; renders without context throw; axe landmarks pass.
- **fm:** prim-3 (SidebarProvider placement/nesting).

### 7. Analytics workflow
- **Prompt:** "A filterable analytics view where a filter strip drives both a set of charts and
  a supporting data table, all reflecting the same current filter state."
- **Success:** filter strip + charts + table sharing one filter state.
- **Rules:** filter-family + chart-family + table-family bound to shared state; valid pie keys;
  compiles; renders.
- **fm:** chart-2 (no DOM util at module load), chart-3, tok-1 (dark via .dark class).

### 8. Settings workflow (overlay + transient feedback)
- **Prompt:** "A settings panel that slides in from the edge, and on save shows a brief
  confirmation that auto-dismisses without occupying permanent space."
- **Success:** edge panel (not centered modal) + transient confirmation with root wiring.
- **Rules:** sheet/drawer-family (not Dialog) ∧ toast-family ∧ a single Toaster at root;
  compiles; renders.
- **fm:** prim-2/Toaster wiring (provider-owned), prim-5.

### 9. Empty / error / loading states for a screen
- **Prompt:** "For a records screen, handle the three non-happy states: loading, empty (no
  records yet, with a primary action), and a load error with a retry."
- **Success:** distinct loading, empty (with CTA), and error (with retry) states.
- **Rules:** skeleton/spinner-family (loading) ∧ empty-family with an action ∧ error-family with
  retry; the three are mutually exclusive by state; compiles; renders.
- **fm:** prim-5; structural correctness of state branching.

## Coverage delta vs V2

- Domains added: chat, charts, pages/composition, navigation, analytics, data-tables (deep),
  forms (deep), feedback/states.
- Failure modes exercised: ~22 / 27 (the chat/chart/dt/form/token families that V2 never
  touched), most now catchable because tsc/render see real types and runtime.

## What V3 does NOT do

No new CI gates, no blocking checks, no Orbit-style restrictions, no `@core/validate`
extraction. V3 is purely a stronger *measurement* of where Core creates value. Enforcement
decisions wait for credible evidence from the full ladder + these composition results.
