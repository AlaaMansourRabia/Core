# Storybook information architecture — WakeCore as a knowledge portal

> Redesigns Storybook so it reflects what WakeCore is *becoming* (a knowledge platform: components →
> widgets → templates + knowledge/evaluation/visual-proof), not just a component library. Reuses
> existing Storybook + autodocs + MDX + Chromatic — no reinvention. This pass **implemented the
> structure**; the per-component page redesign is planned (see §7, it's a generation problem, not a
> hand-authoring one).

## 1. Proposed navigation tree (now live)

```
📚 Getting Started
   Welcome · Overview · Design Tokens (+ token stories) · Dark Mode · AI Agents · Contributing · CI-CD
🧩 Components
   Overview (the catalog, search/filter)
   Primitives · Forms · Navigation · Overlay · Layout · Data Display · Charts · Feedback · Map · Drawing Canvas
   └─ each component → its own page (Docs + stories)
🧱 Widgets            (placeholder) — Overview; later: Analytics · Data · Forms · Navigation
📄 Templates          (placeholder) — Overview; later: Dashboard · Monitoring · Administration · Reports
🧠 Knowledge          Overview → Design Principles · Product Patterns · Selection Guide · Decision Records · Common Mistakes · AI Knowledge · Knowledge Architecture
📊 Evaluation         Overview → Benchmarks · Failure Modes · Learning Loop · Evaluation Architecture
📈 Visual Proof       (placeholder) — Overview; later: Before/After · Selection · Composition · AI Improvements · Benchmarks
🧪 Examples           (kept; app-layout demos — migrates to Visual Proof/Templates later)
```

## 2. Folder structure

`apps/storybook/stories/` — unchanged on disk for components (Storybook nests by the story `title`,
not the file path), plus new doc folders:

```
stories/
  *.mdx                      Getting Started docs (Welcome, Overview, DesignTokens, DarkMode,
                             AgentSkills→AI Agents, Contributing, CICD) + ComponentCatalog (→ Components/Overview)
  primitives/ forms?/ …      component stories (titles now "Components/<Category>/<Name>")
  widgets/Overview.mdx       NEW placeholder
  templates/Overview.mdx     NEW placeholder
  knowledge/Overview.mdx     NEW placeholder
  evaluation/Overview.mdx    NEW placeholder
  visual-proof/Overview.mdx  NEW placeholder
```

Note: the **sidebar tree is driven by `title:`, not folders** — so categories were renamed without
moving files (`Form/`→`Components/Forms/`, `Display/`→`Components/Data Display/`, `Theme/`→`Design
Tokens/`). The token pages (`stories/theme/` + `DesignTokens.mdx`) were later promoted out of Getting
Started into their own top-level **Design Tokens** section, so the sidebar reads as the material
pipeline: Tokens → Components → Widgets → Templates.

## 3. Sidebar structure

Controlled by `storySort.order` in `.storybook/preview.ts` (now nested): Getting Started → Design
Tokens → Components (Overview first, then categories) → Widgets → Templates → Knowledge → Evaluation
→ Visual Proof → Examples → `*`.

## 4. What happened to the Component Catalog

**Kept, repurposed — not deleted.** The giant `ComponentCatalog` (generated from `library-index.json`)
is retitled **`Components/Overview`** — it becomes the Components landing/search page. Its data is
*already generated* from `library-index.json`, so it stays the searchable index.
**Long-term (§7):** the catalog stops being one big page and becomes a thin index over **per-component
generated knowledge** — the same data, surfaced on each component's own Docs page.

## 5. Migration plan

**Done in this pass (verified: `pnpm storybook:build` passes):**
- Retitled **122 files**: component categories → `Components/<Category>/…`; Getting Started docs →
  `Getting Started/…`; Theme → `Design Tokens/…`; Catalog → `Components/Overview`.
- Added 5 placeholder sections (Widgets/Templates/Knowledge/Evaluation/Visual Proof).
- Reordered `storySort`.
- **No component code, no API, no visual changes.** All stories preserved; autodocs preserved.

**⚠️ Migration impact (the honest cost):**
- **Story IDs / deep-link URLs change** (title-derived). Storybook has no redirect mechanism — old
  bookmarks to `?path=/story/primitives-button--…` now live at `…/components-primitives-button--…`.
  This is a **one-time** break; communicate it. (Stories still work; only their IDs moved.)
- **Chromatic will re-baseline**: renamed stories read as new (approve once), old IDs as removed.
  Visuals are unchanged, so approval is mechanical — but it **must happen in Chromatic after push**.

**Done in a later pass — per-component catalog (Challenge #1 below):**
- Every component's autodocs page now renders a **Catalog knowledge** panel (intent / when / when-not
  / chooseOver / insteadUse / requires / pairsWith / variant meaning / related), generated from
  `library-index.json` via a single shared block (`stories/_docs/ComponentKnowledge.tsx`) wired through
  `parameters.docs.page`. **107 of 110** component pages are enriched; the title→entry map was verified
  against the component each story actually imports (chart-type and map pages resolve to the one
  `Chart`/`Map` component; `Core*` widgets and the two Sidebars are mapped explicitly). The only 3
  without a panel — Turn Progress, Area Tree, Checklist Card — are composition demos with no exported
  component (correctly no entry). `Components/Overview` is now a thin searchable index that deep-links
  to each page. No hand-authored MDX, single source of truth.

**Remaining (planned, not done):**
- Migrate `Examples/*` → `Visual Proof` (and the page templates → `Templates`) when those tiers land.
- Promote the ~36 widget candidates / 13 template candidates into the Widgets/Templates sections as
  the manifest tiers are built.

## 6. Files changed

- `.storybook/preview.ts` — `storySort.order` (nested, new sections).
- **122** `*.stories.tsx` / `*.mdx` — `title:` retitled into the new tree.
- **NEW:** `stories/{widgets,templates,knowledge,evaluation,visual-proof}/Overview.mdx`.
- `stories/ComponentCatalog.mdx` — retitled `Components/Overview`.
- `docs/STORYBOOK-IA.md` — this plan.

## 7. Architectural improvements / challenges to the proposal

**Challenge #1 — don't hand-author 124 component pages. ✅ IMPLEMENTED.** Your spec lists ~14 sections per component
(Purpose / When / When-not / Choose over / Related / Common mistakes / AI Knowledge / …). Hand-writing
those as MDX, 124 times, duplicates `library-index.json` and will rot. Per `WAKECORE-NEXT.md` ("author
manifests; generate everything else"), the component Docs page should be a **projection of the
manifest**: a shared `<ComponentKnowledge name="Button"/>` MDX block (or an autodocs enhancement) that
reads `library-index.json` and renders When/Why/`chooseOver`/`avoid`/Related/Variants on *every*
component page. Autodocs already generates Overview/Variants/Playground/API/Source; the a11y addon
covers Accessibility. So the "own catalog per component" goal is reached by **generation + autodocs +
a11y**, not 124 files — and it *retires* the giant catalog by distributing its data. **This is the
highest-value next step and it aligns Storybook with the platform's one-source-of-truth principle.**

**Challenge #2 — the URL break is unavoidable for true nesting.** Storybook can't group top-level
siblings without putting `Components/` in the title, so nesting forces the ID change. Accepted as a
one-time migration (above) rather than half-nesting. If preserving old URLs were a hard requirement,
the alternative is *not* nesting — which forfeits the whole IA. Nesting is the right 3–5-year call.

**Challenge #3 — Knowledge/Evaluation are documentation, and should largely be generated too.** The
Selection Guide = `library-index` projection; Failure Modes = `domain_map.yaml`; Benchmarks =
`eval/results`. Author them as views over existing artifacts, so they never drift from what agents
actually consume. The placeholders link to those sources today.

**Recommendation beyond the proposal:** treat **Storybook as a *projection target*, not a source.**
Components/Widgets/Templates/Knowledge/Evaluation/Visual-Proof pages should all be generated from the
manifest family + eval artifacts. That keeps the human portal, the agent knowledge, and the eval in
permanent sync — the same flywheel discipline, applied to docs.
