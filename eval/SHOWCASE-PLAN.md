# WakeCore Showcase — making the value *visually* obvious

> Goal: complement the statistical evidence (`eval/EVIDENCE.md`) with **side‑by‑side visuals** that
> a non‑statistician can read in two seconds — "package‑only baseline" (A1) vs "with WakeCore
> knowledge" (A4). Design only; no paid evals run here.

## What "A1 vs A4" means for a viewer

- **A1 (fair baseline):** the agent knows the package — component names, imports, props — but has
  **no guidance on which to pick or how to compose**. It tends to produce a *valid but literal/plain*
  UI, or reach for the obvious-but-wrong component.
- **A4 (full knowledge):** + semantic catalog + composition skill + failure modes. It picks the
  *right* component, composes the screen, and wires states.

The best showcase tasks are ones where A1 renders something **valid but visibly weaker** — so the
contrast reads as "plain vs polished," not "broken vs working" (a broken A1 is a weaker story and
muddies the message).

## The shortlist — ranked by visual obviousness

Each: the decision, what A1 likely shows, what A4 should show, what a reviewer should see improve,
and render feasibility (matters for screenshots — see *Generating the evidence*).

| # | Task | The visible difference | Render |
|---|------|------------------------|--------|
| 1 | **side-panel** (Sheet vs Dialog) | A1: a **centered modal** that blocks the page. A4: a **panel sliding from the right edge**, main content still visible. *Layout is fundamentally different — the single most obvious shot.* | ✅ DOM |
| 2 | **data-grid** (DataTable vs Table) | A1: a **plain static table**. A4: a **rich grid** — sortable column headers, a filter input, pagination controls. *Visible chrome the baseline simply doesn't have.* | ✅ DOM |
| 3 | **transient-feedback** (Toast vs Alert) | A1: a **permanent inline alert** occupying page space. A4: a **floating toast that auto‑dismisses**. *Best told as a 2‑frame / short GIF (appears → fades).* | ✅ DOM (animated) |
| 4 | **multi-step-form** (Stepper + sections) | A1: **one long flat form**. A4: a **stepper with a progress indicator**, sectioned steps, inline validation, back/next. *Structure and wayfinding appear.* | ✅ DOM |
| 5 | **destructive-action** (variant emphasis) | A1: a **neutral/default button**. A4: a **red `destructive` button**. *Smallest change, crispest read — a clean color/emphasis diff; great "tiny but telling" slide.* | ✅ DOM |
| 6 | **template-gallery** (Dialog + search + cards) | A1: a **plain list or bare cards**. A4: a **focused dialog** with a search bar over a **card grid**, preview before confirm. | ✅ DOM |
| 7 | **app-sidebar** (shell + provider) | A1: a sidebar‑ish column, often without working collapse/layout. A4: a proper **collapsible app shell** (sidebar + main). *Strong, but A1 may render imperfectly — vet before using.* | ✅ DOM (vet) |
| 8 | **dashboard-composition** (KPIs + charts + loading) | A1: flat blocks, often **no loading state**, charts missing/raw. A4: a **row of KPI cards**, **trend chart panels**, **skeleton** while loading. *Most impressive IF it renders.* | ⚠️ charts are canvas (see caveat) |

**Recommended core set for the README (5):** #1 side‑panel, #2 data‑grid, #3 transient‑feedback,
#4 multi‑step‑form, #5 destructive‑action — all DOM‑renderable, each a different *kind* of win
(layout / features / behavior / structure / emphasis). Add #6–#8 for docs/decks.

**Why these and not the others:** `button-as-link`, `icon-button-hint`, `validated-form` are real
wins but **low visual contrast** (a hover hint, an inline error, an `asChild` link look nearly
identical in a still). Keep them for the statistical table, not the visual showcase.

## Before/after evidence format

One repeatable **comparison card**, used identically in README, docs, and slides:

```
┌─ Task: "Build a panel that slides in from the edge to edit filters,
│         keeping the page visible behind it."                          ← the user goal (no component named)
├───────────────────────────────┬───────────────────────────────────┐
│  A1 · package only            │  A4 · with WakeCore knowledge      │
│  [screenshot: centered modal] │  [screenshot: right‑edge sheet]    │
├───────────────────────────────┴───────────────────────────────────┤
│  ✗ Centered Dialog blocks the page   ✓ Sheet keeps context visible │  ← 1–3 visible deltas
│  Decision: Sheet over Dialog (chooseOver)                          │  ← the encoded decision
│  model claude‑opus‑4‑8 · real generated output · [code] · [run]    │  ← provenance + links
└────────────────────────────────────────────────────────────────────┘
```

**Rules that keep it credible (and on‑brand with the rest of the evidence package):**
- **Same prompt, same viewport, same theme** for both arms — the *only* variable is the knowledge layer.
- **Real generated output**, never hand‑drawn mockups. Link each panel to its captured `.tsx` and the
  run dir (`eval/results/runs/...`), so anyone can reproduce.
- **State the decision** in WakeCore's own vocabulary (`chooseOver`, `requires`, a `pattern`), tying the
  picture back to the knowledge that caused it.
- **Honesty footer:** model, date, "1 sample shown — selection effects are reproducible; see
  `eval/EVIDENCE.md` for rates and CIs." No cherry‑picking claims beyond what the stats support.

**Format variants:**
- **Static pair** (most tasks) — two PNGs side by side.
- **2‑frame / GIF** (transient‑feedback, optionally icon‑button‑hint) — trigger → result, to show
  ephemerality/interaction a still can't.
- **Slide** — one card per slide; lead with the screenshot, the delta bullets as the talking points.
- **README** — a compact 2‑column table of the core‑5 thumbnails linking to full‑size + code.

## Generating the evidence (honestly)

What exists vs. what a real showcase needs:

- **We have not captured A1 renders.** The contracts pilot captured A4/A5; the V2 run captured
  with/without. A showcase needs **A1 and A4 for the same tasks** → a small capture run
  (`--arms=A1,A4` over the shortlist; the runner already persists code per generation). Est. **~$5–8**.
- **Screenshots need a real browser, not render‑smoke.** `eval/graders/render.mjs` is a *server‑render
  floor* — no effects, no canvas. The repo already runs **Vitest + Playwright/Chromium** for component
  tests; that is the right engine to mount each generation and screenshot it. (Dashboard charts are
  canvas/echarts — they need the browser path *and* sample data; that's why #8 is ⚠️.)
- **Pick the rendering arm per task honestly:** if an A1 generation fails to render, say so (a real,
  citable outcome) rather than substituting a prettier failing variant. Prefer tasks where A1 renders
  *valid but plainer* for the headline cards.

**Proposed pipeline (not built here):** capture run (A1,A4 × shortlist) → mount each `.tsx` in the
existing Chromium harness at a fixed viewport/theme → screenshot → assemble comparison cards from a
small template. Reuses infrastructure that already exists; no new runtime deps.

## What this is NOT
No cherry‑picked or hand‑built mockups; no claim the visuals replace the statistics (they illustrate
them); no new runtime/enforcement. The showcase is a *communication layer* over evidence we can already
reproduce.
