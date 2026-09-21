# Core — Execution Roadmap

> **What this is.** The canonical execution roadmap for Core. It operationalizes the architecture in
> [`CORE-ARCHITECTURE.md`](./CORE-ARCHITECTURE.md) and [`CORE-NEXT.md`](./CORE-NEXT.md)
> into concrete workstreams, deliverables, and acceptance criteria, grounded in the **current** state of
> the repo (post-#128). It is organized around **two parallel tracks** (below).
>
> **What this is not.** The architecture itself. The vision, the artifact/runtime model, the manifest
> schema, and the "why" live in [`CORE-ARCHITECTURE.md`](./CORE-ARCHITECTURE.md),
> [`CORE-NEXT.md`](./CORE-NEXT.md), [`TIER-ARCHITECTURE.md`](./TIER-ARCHITECTURE.md),
> [`ARTIFACT-CLASSIFICATION.md`](./ARTIFACT-CLASSIFICATION.md), and
> [`BUILDER-CONSUMPTION-WALKTHROUGH.md`](./BUILDER-CONSUMPTION-WALKTHROUGH.md). This doc sequences the
> work to get there; it does not restate them.
>
> **Thesis.** Core is a substrate and knowledge platform for agent-built UI. The design system is the
> **floor**; the product is the **flywheel** — knowledge that provably improves each time an agent
> exercises it. This roadmap describes how to build the flywheel without it polluting itself, while the
> design system underneath it keeps improving.

---

## The two-track model

Core evolves as **two products in parallel**, not one linear program of work.

**Track A — Platform Evolution (the brain).** Everything that makes Core agent-native: the unified
knowledge model, manifest generation, lineage, knowledge resolution, evaluation, the runtime/builder, the
learning flywheel, and optimization. These stages have hard dependencies and **must remain sequential** —
each builds on the last; skipping ahead builds on sand.

**Track B — Artifact Evolution (the body).** The design system itself: components, widgets, templates,
flows, and product blueprints. This **never stops evolving** and does not wait for Track A. Artifacts
improve continuously, and in doing so they exercise and validate the platform.

**The two tracks feed each other.**

- Artifact evolution **validates and pressure-tests** the platform. Recent work is the proof: while
  authoring manifests we discovered and promoted **MetricCard, KPIBar, KPISummary, and TrendChart**, and
  reclassified **TaskMonitor** widget→template. Those were not distractions — they improved the design
  system _and_ stress-tested the manifest schema at the same time.
- Platform evolution **improves how artifacts are authored, resolved, and verified** — better schema,
  cheaper retrieval, a trustworthy eval, an executable runtime — which raises the ceiling for every
  artifact.

Neither track blocks the other. What Track A _does_ govern is the **depth of investment** Track B can bank
before it would have to be re-done: an artifact reaches full manifest maturity as the platform stages that
define that maturity land (see the sequencing note under Track B). This preserves the one real caution from
`CORE-ARCHITECTURE §X / §XI.4` — _don't mass-author artifact knowledge against an immature schema_ —
without pausing artifact evolution.

> **ID convention.** Track A platform stages are `A1–A6`. Track B sections are named (Components, Widgets,
> …). The evaluation harness has its own **ablation-arm** IDs (`A0–A5`); those always appear scoped as
> "ablation arm A*x* (eval harness)" to avoid confusion with platform stages.

---

## 0. Where we actually are (snapshot, post-#128)

| Layer                                | Track | State                        | Concrete                                                                                                                                                                                                                                                                                                             |
| ------------------------------------ | ----- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Foundation**                       | —     | ✅ done                      | `@core/core-ui` (122 catalogued subpaths → 118 UI artifacts), `@core/core-tokens`, `@core/core-utils`; React + Tailwind 4 (`wwc:`), Storybook                                                                                                                                                               |
| **Semantic knowledge**               | A     | ✅ shipped, **but 3 shapes** | `library-index.json` (118 entries, 51 full / 67 concise / 0 generated) · `patterns[]` · TanStack-Intent skills · `domain_map.yaml` (27 `fm-*`) — _hand-authored in parallel_                                                                                                                                         |
| **Tier classification**              | A/B   | ✅ merged #128               | `tier` on all 122 → **73 components · 33 widgets · 13 templates · 3 utilities**; **8 template manifests** (complete) + **33 widget manifests** (5 complete, 28 stub); TaskMonitor reclassified widget→template                                                                                                       |
| **Widgets promoted**                 | B     | ✅ ongoing                   | DataTable, MetricCard, KPISummary, KPIBar, TrendChart (5 complete widget manifests)                                                                                                                                                                                                                                  |
| **Template archetypes**              | B     | ✅ ongoing                   | Regular Dashboard, Detail, LoginPage, ErrorPage, TaskMonitor (5 manifested); product-only routes such as CoreOrgOverview, CoreOrgRealityCapture, and CoreOrgAiReport are excluded from the selectable template catalog                                                                                               |
| **Eval / enforcement**               | A     | ✅ working                   | validators-as-graders in `scripts/validators/`; ablation ladder **A0→A4 + A5** (contracts pilot, eval harness); deterministic graders (component-choice, imports, provider-wiring, failure-mode) + behavioral (`tsc` compile, render-smoke); CI: `catalog-integrity` **hard-gates**, LLM evals **warn-only** nightly |
| **Storybook IA**                     | X-cut | ✅ restructured              | nav mirrors tiers; 107/110 component pages carry a generated Catalog-knowledge panel                                                                                                                                                                                                                                 |
| **Knowledge resolution (retrieval)** | A     | ❌ absent                    | ~62k tokens injected **wholesale** per run                                                                                                                                                                                                                                                                           |
| **Hard eval**                        | A     | ⚠️ partial                   | structural graders trustworthy; **no held-out corpus, single model, no axe/a11y, render-smoke is SSR-only**                                                                                                                                                                                                          |
| **Runtime / builder**                | A     | ❌ absent                    | no reference renderer, no instance model in code                                                                                                                                                                                                                                                                     |
| **Learning flywheel**                | A     | ❌ absent (designed)         | the governed self-improvement loop isn't built                                                                                                                                                                                                                                                                       |

**Evidence to date (eval harness).** Composition is the largest proven lever — adding the composition
skill lifts failure-mode avoidance **23% → 97% (+73 pts)** with separated 95% CIs. Selection helps but is
not yet conclusive — the semantic catalog moved component-choice **83% → 97% (+13)**, CIs overlap
(p≈0.19). The original "+100 imports lift" was disproven as a rigged-baseline artifact (imports and
provider-wiring are **100% across all arms**), and a grader bug that had falsely blamed a "Core Form
typing bug" was corrected. Behavioral: structural checks hit 100% but real `tsc` **compile is ~60%**
single-component (76% with full contracts). The harness disproves its own inflated claims — that
discipline is a feature, not a bug.

---

## Guiding rules (apply to both tracks, every milestone)

1. **One source of truth.** Structured manifests are the source; `library-index.json`, skills, retrieval
   indexes, and Storybook panels are **generated projections**. Never hand-maintain two encodings.
2. **Prove before enforce.** Knowledge → validator correctness → agent A/B lift (CI lower bound > 0) →
   behavioral confirmation → warn-only CI → hard gate. Per-defect, never blanket.
3. **Held-out gate for all learning.** No fact enters knowledge because an agent asserted it — only
   because an eval it _didn't author_ confirmed it on held-out tasks.
4. **`confidence` is derived, never hand-set.** Provenance + verifying-eval + freshness compute it.
5. **No half-graders.** A grader either measures the real thing (real browser, real `tsc`) or is removed.
6. **Artifact depth follows platform maturity.** Track B evolves continuously, but banks _full_ manifest
   depth on an artifact only as the platform stage defining that depth lands — so artifact work validates
   the platform without accumulating knowledge that must be re-authored.

---

# Track A — Platform Evolution (the brain)

Sequential. Each stage unlocks the next. Every stage below carries **Goal · Workstreams · Deliverables ·
Acceptance criteria · Dependencies · Size**. All technical detail from the prior single-ladder roadmap is
preserved here.

---

## A1 — Unified Knowledge Model · _consolidation_ · **DONE (flipped) — overlay layer deferred**

**Goal.** Collapse the three knowledge shapes (`library-index.json`, `patterns[]`, manifests) into **one
manifest family**, with provenance on every entry. Knowledge that has three shapes cannot be scaled,
resolved, or governed.

> **Schema frozen — see [`A1-DECISION-RECORD.md`](./A1-DECISION-RECORD.md).** The pilot (5 components +
> DataTable projection) is complete. The decision record freezes `artifact-manifest/0.2`, resolves every
> duplication (D1–D13: `chooseOver.over`→`component`, `commonMistakes`→generated `avoid`, providers vs
> composition, `category`→bucket, lineage-vs-`knowledgeLevel`, `patterns[]`, `overlay.json`, one `lineage`
> schema, …), and specifies the full migration plan (order · batching · gates · rollback · CI · final
> flip) for the remaining 113 artifacts. A1 workstreams below are now mostly mechanical against that freeze.

**Workstreams**

- **A1.0 Freeze the schema (done — §5 resolved 2026-07-05).** `artifact-manifest/0.2` + field-ownership
  table; all 9 open questions decided (`A1-DECISION-RECORD.md` §5).
- **A1.1–A1.6 Migration + flip (DONE).** All **122 catalog entries + 9 patterns** are `0.2` manifests;
  `library-index.json` is a fully **generated projection** (banner + `pnpm generate:catalog`), CI-enforced
  by `pnpm validate:manifests` (manifest-integrity + `project --check`) — a hand-edit anywhere fails the
  gate. Transitional adapters (`over→component`, `requires` fallback) retired. Tooling:
  `migrate-components/-widgets/-templates.mjs`, `project-catalog-manifests.mjs`, `manifest-integrity.mjs`.
- **Deferred — the `overlay.json` contract layer.** `eval/contracts/{component-api,overlay}.json` are
  **export-keyed** (16 exports incl. sub-exports FormField/FormControl/ChartContainer that are _not_
  catalog artifacts) and consumed directly by the eval. Folding them into artifact-keyed manifests is a
  granularity mismatch coupled to the eval — a dedicated slice, not part of the catalog flip (see
  `A1-DECISION-RECORD.md` §D7).
- **A1.1 ComponentManifest schema.** Extend the existing widget/template manifest family down to
  components (`manifests/*.component.json`), or a unified `manifests/*.artifact.json`. Reuse the
  `artifact-manifest/0.1` schema + validators already in `scripts/validators/`.
- **A1.2 Invert the source of truth.** `library-index.json` becomes a **generated projection** of the
  manifests (extend `scripts/sync-library-index.mjs` to emit, not hand-edit). Semantic fields
  (`intent`/`when`/`chooseOver`/`avoid`) move _into_ manifests; structural fields stay generated from
  `.d.ts` / exports.
- **A1.3 Fold in `patterns[]` and contracts.** `patterns[]` → template/product-pattern manifests;
  `eval/contracts/*` → per-artifact `dataContract`. One home each.
- **A1.4 Universal provenance (Knowledge Lineage).** Every manifest entry carries the lineage block
  (origin, authoredBy, derivedFrom, verifiedBy, status ∈ candidate→verified→accepted→stale→retired,
  derived `confidence`). Generalize the blocks already present in the 8 template manifests.
- **A1.5 Migrate the 118 component semantics** into their manifests (51 full carry over verbatim; 67
  concise flagged `status: candidate`).
- **A1.6 Manifest schema fields G3/G4.** Land the manifest-side load-bearing gaps — **G3 template
  dataSources** and **G4 widget states** (from `BUILDER-CONSUMPTION-WALKTHROUGH §10`) — as schema fields
  so Track B templates/widgets can reach full maturity. (Runtime-side gaps G5/G6 land in A4.)

**Deliverables**

- `ComponentManifest`/unified `artifact-manifest` schema + a `manifest-integrity` validator.
- A single `pnpm generate` that emits `library-index.json`, skills, and Storybook Catalog panels from
  manifests.
- Lineage block generalized across all artifact manifests; component semantics migrated.

**Acceptance criteria**

- `library-index.json`, skills panels, and Storybook Catalog panels are **all regenerated from manifests**
  by `pnpm generate` — editing a manifest and regenerating reproduces them byte-for-byte.
- Zero hand-authored duplication: a semantic fact exists in exactly one file.
- `catalog-integrity` gate green; `manifest-integrity` proves every catalogued artifact has a manifest and
  every manifest projects cleanly.
- Every entry has a lineage block; no `confidence` is hand-set.

**Dependencies.** None new. **Size.** Medium (schema + generator + migration; semantics already written).

---

## A2 — Knowledge Resolution · _the unlock_ · **STARTED (index + resolver built; A/B pending key)**

> **Status (2026-07-05).** Deterministic resolver shipped (`eval/lib/resolution.mjs`): intent-match
> (stemmed token overlap over name/intent/when/tags) + structural walk (providers + composed parts, then
> pairsWith under a cap) + referenced failure modes. Offline measurement (`pnpm eval:resolution`, no model
> calls): **median 6.3× reduction of the catalog knowledge** (whole-prompt AR-vs-A4 = 4.7×), **87% of tasks
> retrieve their expected component** (13/15), fully deterministic. The **AR arm** is wired into the harness
> (`systemForArm("AR")`) for the paid A/B. Remaining: run the A/B quality comparison (needs
> `ANTHROPIC_API_KEY`). The two retrieval misses — Sonner (a prompt that avoids all toast vocabulary) and
> DataTable in content-dashboard (dashboard/metric vocabulary floods the ranks) — are the documented
> motivation for semantic embeddings, deferred per "simple indexing first". The eval task set was expanded
> 10→15 with harder composition/workflow tasks (A3.1) which surfaced the second case.

_(formerly "Retrieval" — renamed: the system resolves which knowledge a task needs, of which fuzzy
retrieval is one mechanism.)_

**Goal.** Replace wholesale injection (~62k tokens) with **query-the-knowledge**: give the agent a small,
relevant slice per task. Every tier above and every learning step depends on not blowing the prompt budget.

**Workstreams**

- **A2.1 Resolution index.** Generated from the A1 manifests. Two mechanisms, simplest-first (per
  `CORE-NEXT`): **intent matching** (fuzzy over `intent`/`when`/tags) + **structural resolution**
  (graph-walk over `requires`/`pairsWith`/`composedOf`/`requiredWidgets`). No vector DB unless simple
  indexing demonstrably fails.
- **A2.2 Resolution API.** `resolve(intent, context) → { artifacts, patterns, failureModes }` returning a
  bounded budget (top-k + their structural closure + relevant `fm-*`).
- **A2.3 Wire into the eval harness.** New **resolution arm** (= full-knowledge arm A4 in the eval harness,
  but delivered via `resolve()`); compare against A4 (full injection) on quality _and_ token cost.

**Deliverables**

- A generated, deterministic resolution index over the manifest graph.
- The `resolve()` API returning a bounded knowledge slice.
- An eval-harness resolution arm and a token-cost report.

**Acceptance criteria**

- Median injected-knowledge tokens per task drop **≥5×** vs the A4 wholesale arm.
- The resolution arm holds or beats A4 on component-choice + failure-mode graders (CI lower bound ≥ 0).
- Resolution is deterministic and generated — no hand-curated per-task context.

**Dependencies.** A1 (uniform manifests to index). **Size.** Medium–large.

---

## A3 — Trust & Evaluation · _trust_

**Goal.** Make the eval trustworthy enough to _gate a self-modifying loop_: held-out corpus, multi-model,
real browser + a11y, regression baselines. You cannot learn or optimize against an eval you don't trust.

**Workstreams**

- **A3.1 Statistical power.** Raise reps to **k ≥ 10/arm**; add harder composition/workflow tasks
  (dashboard-composition, multi-step-form, app-shell nav, settings overlay+toast, empty/error/loading).
  Target: the **selection** lift (83→97, p≈0.19) reaches a separated CI or a conclusive null.
- **A3.2 Real-browser render + a11y.** Commit render-smoke to a real browser (reuse the Vitest/Playwright
  browser mode already in the repo) or delete it; **add an axe/a11y grader** (does not exist yet). This
  render engine is the A4 reference renderer (shared).
- **A3.3 Held-out corpus + authoring discipline.** A verification task set authored **separately** from
  knowledge authors; knowledge is never tuned on it. Document the process (who authors, review).
- **A3.4 Regression baselines.** Nightly stores per-metric baselines; McNemar on deltas; warn-only → gate
  once stable.
- **A3.5 Multi-model.** Run the ladder on ≥2 models to separate model-specific artifacts from real lift.

**Deliverables**

- k≥10 harness + a harder composition/workflow task set.
- Real-browser compile + render + axe graders against real `@core/core-ui` types.
- An isolated held-out corpus + a written held-out authoring process.
- Nightly regression baselines + alerting (warn-only initially).

**Acceptance criteria**

- Held-out corpus exists and is provably isolated from knowledge authoring.
- Compile + render + a11y graders run in a real browser against real built types.
- ≥1 previously-inconclusive lift (selection) is now conclusive or conclusively null.
- Nightly regression baseline + regression alert is live (still warn-only).

**Dependencies.** A1 (stable knowledge to measure). Parallelizable with A2. **Size.** Large.

---

## A4 — Runtime / Builder · _consumption_

**Goal.** Prove manifests are _buildable_, give the runtime that renders instance trees, and publish the
contract a third-party consumer must satisfy. This is also the render engine the eval (A3.2) grades in.

**Workstreams**

- **A4.1 Reference renderer.** Renders a manifest/instance tree; doubles as the browser-eval engine
  (A3.2) and the contract test that a manifest is buildable.
- **A4.2 Instance model + binding grammar (G6/G5).** Persisted instance tree with `{{source.path}}`
  bindings — the runtime-side load-bearing gaps: **G6 page-instance model** (critical) and **G5
  data-binding grammar**, from `BUILDER-CONSUMPTION-WALKTHROUGH §10`. (Manifest-side G3/G4 land in A1.)
- **A4.3 Conformance spec.** What a third-party builder/agent must support to consume Core.
- **A4.4 Versioning & migration.** Token/component/manifest version → instance propagation; pin-vs-migrate
  policy (Open decision G7 in `TIER-ARCHITECTURE`).

**Deliverables**

- A reference renderer that builds every complete manifest.
- An instance model + `{{source.path}}` binding grammar in code.
- A published conformance spec; a versioning/migration policy.

**Acceptance criteria**

- Reference renderer builds every complete manifest; a page instance round-trips (serialize → render →
  identical output).
- Conformance spec published; the renderer is the eval's render/a11y backend.

**Dependencies.** A1 (schema) + Track B manifests to render. **Size.** Large.

---

## A5 — Learning Flywheel · _self-improvement (the differentiator)_

**Goal.** The governed loop: distill knowledge from runs, verify on held-out, write to a governed store,
decay stale entries. This is the product.

**Workstreams**

- **A5.1 Distillation.** Turn eval runs + failures into candidate knowledge (candidate lineage status).
- **A5.2 Held-out verification gate.** A candidate becomes `verified`→`accepted` only when an eval it
  didn't author confirms it (A3 corpus). Rejected candidates are logged, not merged.
- **A5.3 Governed store + decay.** Freshness lifecycle; `accepted` entries are re-verified periodically or
  decay `stale`→`retired`; `confidence` recomputed.
- **A5.4 The n=1 slice → N.** Scale the single proven flywheel slice (`CORE-NEXT`: "the architecture
  phase is closed; scaling the n=1 slice is implementation").

**Deliverables**

- A distillation step producing candidate knowledge with lineage.
- A held-out verification gate wired to the A3 corpus.
- A governed knowledge store with a freshness/decay lifecycle.

**Acceptance criteria**

- A knowledge entry can be added _only_ via the held-out gate; provenance shows the verifying eval.
- Demonstrated end-to-end: a real agent failure → distilled candidate → gate-verified → accepted →
  measurable lift on a _later_ held-out run.

**Dependencies.** A3 (trustworthy gate) + A1 (lineage). **Size.** Large.

---

## A6 — Optimization · _compounding_

**Goal.** SkillOpt / automated knowledge optimization over the verified eval + learning store.

**Workstreams / Deliverables.** An optimizer that rewrites knowledge to improve the A3 objective, each
change passing the held-out gate.

**Acceptance criteria.** The optimizer improves ≥1 A3 metric by rewriting knowledge, every change
gate-verified. **Dependencies.** A3 + A5. **Size.** Research.

---

# Track B — Artifact Evolution (the body)

Continuous. Runs alongside Track A and does not wait for it. Each artifact section has a **definition of
done** (what a fully-mature artifact carries) and ongoing workstreams. Artifact work is the platform's
best pressure-test — every widget promoted or template hardened exercises the schema, the resolver, and
the eval.

> **Sequencing within Track B.** Artifacts improve continuously, but a manifest reaches _full_ depth as the
> platform stage defining that depth lands: full component/widget semantics consolidate under **A1**;
> `dataSources`/`states` fields under **A1.6**; executable previews / instance examples under **A4**;
> per-artifact learning under **A5**. Until then, artifacts still progress — stubs, stories, visual proof,
> and composition guidance — they just don't bank knowledge that A1/A4 would force a re-author of. This is
> how Track B validates Track A instead of racing ahead of it.

---

## Continuous cross-artifact workstreams

Distinct from the per-artifact **definition-of-done** below, these run continuously across _all_ tiers.
Each is tied to a platform mechanism that **measures** it, so it is a gate, not an aspiration (full
rationale in [`A1-DECISION-RECORD.md`](./A1-DECISION-RECORD.md) §6). A workstream is listed only if such a
mechanism exists or is on the roadmap.

| Workstream                          | Applies to                | Measured / enforced by                                                    |
| ----------------------------------- | ------------------------- | ------------------------------------------------------------------------- |
| API consistency & genericity        | components, widgets       | `component-api.json` diff + the "could ship in shadcn?" boundary test     |
| Accessibility                       | all                       | A3.2 axe grader (real browser)                                            |
| Performance & bundle size           | all                       | per-artifact build-size report; render cost                               |
| Visual consistency                  | widgets, templates        | Chromatic deterministic visual proof                                      |
| Test coverage                       | components, widgets       | Vitest browser tests + screenshot baselines                               |
| AI usability (knowledge quality)    | all                       | eval graders (selection/composition/failure-mode) + manifest completeness |
| Documentation freshness             | all                       | generated from manifests (A1) — the work is keeping generation lossless   |
| Versioning, deprecation & migration | all                       | A4.4 version→instance propagation; `lineage.status` (`stale`/`retired`)   |
| Adoption                            | widgets, templates, flows | composition graph + eval-task coverage                                    |

---

## Components — ongoing improvement of primitives

**Goal.** Keep the 73 components a stable, generic, accessible vocabulary — the "floor" everything else
resolves against.

**Ongoing workstreams (dimensions).**

- **API consistency** — prop naming, controlled/uncontrolled patterns, event signatures aligned across
  the set.
- **Accessibility** — roles, keyboard, focus, ARIA; every component clears the axe grader (A3.2).
- **Variants** — the right set, no sprawl; variant intent documented.
- **Performance** — render cost, memoization, bundle weight.
- **Tokens** — full token adherence; no hard-coded values.
- **Documentation** — generated from the manifest; kept current.
- **Manifests** — a `*.component.json` per component (A1.1), replacing the hand-authored catalog entry.
- **Stories** — Storybook coverage of states and variants.
- **Evaluations** — component-choice/failure-mode coverage in the eval task set.

**Definition of done (per component).** manifest · generated knowledge · accessible (axe-clean) · token-
pure · stories for all states · appears in ≥1 eval task where it's the correct/`acceptable`/`forbidden`
choice.

---

## Widgets — identify and promote recurring patterns

**Goal.** Continuously surface data-bound compositions that recur across screens and promote them to
first-class widgets — exactly the pattern that produced MetricCard, KPIBar, KPISummary, and TrendChart.

**Current widgets (5 complete manifests):** **DataTable · MetricCard · KPISummary · KPIBar · TrendChart**
(plus 28 stub widget manifests awaiting A1 consolidation). Promotion is driven by observed repetition in
templates/pages, not speculation.

**Definition of done (per widget).** Every widget should eventually have:

- **component** (the real, exported implementation)
- **manifest** (`*.widget.json`: regions, `requiredWidgets`/`requiredComponents`, `dataContract`,
  `states`, lineage)
- **knowledge** (intent / when / chooseOver / failure modes — generated from the manifest)
- **stories** (Storybook coverage)
- **visual proof** (deterministic Chromatic snapshot)
- **evaluation task** (a task where choosing/composing it correctly is graded)
- **composition guidance** (how it composes with components + other widgets)
- **usage examples** (real instances)

**Ongoing workstream.** As A1 lands, promote the 28 stubs to complete; each new widget ships the full
definition-of-done above. Continue the promote-on-repetition loop.

---

## Templates — executable contracts, not documentation

**Goal.** Grow the archetype set as real product screens recur, and evolve templates from _documented
compositions_ into **executable contracts**: a template manifest + instance model that a runtime can build
and an eval can grade, not just a Storybook page.

**Current archetypes:** **Regular Dashboard · Detail · Login · Error · TaskMonitor**
(TaskMonitor reclassified widget→template in #128). Each already owns
its Docs + a deterministic visual Preview in Storybook. Future archetypes grow naturally as new product
shapes recur.

**Definition of done (per template).** Every template should eventually have:

- **manifest** (`*.template.json`: archetype, regions, `requiredWidgets`, `dataContract`, `dataSources`,
  variants, lineage)
- **documentation** (generated from the manifest)
- **deterministic visual preview** (Chromatic-safe, real components — the standard set in #128)
- **composition graph** (the resolved widget/component tree)
- **variants** (documented instance/variant relationships — e.g. the Detail family)
- **example instances** (real `{{source.path}}`-bound instances, once A4 lands)
- **evaluation task** (a task that grades correct template selection + assembly)

**Becoming executable contracts.** Today a template preview is a hand-written story. As **A1.6** (template
`dataSources`) and **A4** (instance model + binding grammar) land, the template manifest becomes the
source: the runtime renders it from a data binding, and the deterministic preview becomes a _rendered
instance_, not a bespoke composition. That is the transition from documentation to contract.

---

## Flows — orchestrations built from templates and widgets

**Goal.** Introduce **Flows** as the next abstraction above Templates (the concept renamed from
"Experiences" in `CORE-ARCHITECTURE §XI.8`): multi-step, stateful **orchestrations** built from
templates and widgets — executable, not illustrative.

**Candidate flows (from the Core domain).** **Inspection · Incident Reporting · Reality Capture ·
Compliance Review · AI Report Workflow.**

**Shape.** A flow is an ordered graph of template instances with transitions, shared state/context, and
entry/exit conditions — e.g. _Incident Reporting_ = capture (Detail) → triage (Dashboard) → review
(Regular Dashboard) → sign-off. A **FlowManifest** schema defines steps, the templates each step binds, transition
conditions, and the flow-level data contract.

**Definition of done (per flow).** FlowManifest · step→template bindings · state/context contract ·
deterministic preview of each step · an evaluation task that grades correct orchestration · usage example.

**Dependencies.** Template maturity (above) + the A4 runtime (flows are executed, so they need the instance
model + renderer). Flow authoring begins in earnest once A4 lands; the FlowManifest schema can be drafted
alongside A1.

---

## Product Blueprints (future) — reusable product architectures

**Goal.** The long-term direction: **reusable product architectures**, not individual screens — a composed
set of flows, templates, and widgets that stands up a whole product surface with its navigation, data
model, and defaults.

**Candidate blueprints.** **Executive Dashboard · Safety Workspace · Compliance Workspace · Construction
Monitoring · Owner Portal · AI Insights.**

**Shape.** A blueprint composes flows + templates into an app-shell (navigation, context switching, shared
providers) with a product-level data contract — the difference between "a Dashboard screen" and "the Safety
Workspace product." A **BlueprintManifest** references flows/templates and defines the shell.

**Status.** Directional. Blueprints are authored only after Flows are executable (A4) and the learning loop
(A5) can improve them from real usage. Listed here so Track B has a horizon, not a near-term workstream.

---

# Cross-cutting workstreams

These span **both tracks**. Every milestone in Track A or Track B should advance all four.

- **Storybook.** The projection/portal target (`STORYBOOK-IA.md`): nav mirrors the tiers; every artifact,
  manifest, and knowledge change is reflected as a generated panel or story. Storybook is a _projection_,
  never a source. Ongoing: migrate Examples → Visual Proof; promote widget/template sections as tiers
  mature.
- **Documentation.** Architecture docs stay canonical and hand-owned; artifact/knowledge docs stay
  **generated** from manifests (A1). A milestone that changes a contract updates the relevant canonical doc
  in the same change.
- **Evidence.** Eval results, ablation numbers, visual proof, and behavioral-grader outputs are the
  project's evidence base. Every milestone adds evidence (a new eval task, a re-baselined snapshot, a
  measured lift) — claims require CI lower bound > 0.
- **Releases.** Changesets + the `next`/`latest` channels (per `CLAUDE.md`). Every milestone ships: a
  platform stage or an artifact reaching definition-of-done is a release with a changeset, not an
  open-ended branch.

---

## First slice (the next 2–4 weeks)

Concrete, shippable, and unblocking. Runs on **both tracks in parallel**.

**Track A (A1 — Unified Knowledge Model):**

1. Define the `ComponentManifest`/unified `artifact-manifest` schema (extend `artifact-manifest/0.1`) + a
   `manifest-integrity` validator.
2. Write the generator: `manifests/* → library-index.json` (+ skills + Storybook panels), one
   `pnpm generate`. Prove byte-identical regeneration.
3. Migrate 5–10 decision-heavy components (button, sonner/toast, banner, data-table, dialog) into
   manifests with full lineage as the pilot; regenerate; confirm the eval ladder numbers are unchanged
   (no knowledge lost in the round-trip).
4. Add the eval-harness **resolution arm** stub (no index yet) so A2 plugs in cleanly.

**Track B (continuous, disciplined):** 5. Promote 2–3 of the 28 stub widget manifests to complete for widgets already recurring in templates
(candidates from the Regular Dashboard/Detail compositions), each shipping its definition-of-done set. 6. Keep template previews at the #128 quality bar; add any missing deterministic Visual Proof snapshots. 7. Draft (not implement) the FlowManifest schema alongside A1 so the two schemas co-design.

**Exit criteria for the slice.** Editing a component manifest and running `pnpm generate` reproduces the
current `library-index.json` semantics for the piloted components byte-for-byte; `catalog-integrity` +
`manifest-integrity` are green; the ablation ladder produces the same numbers as before the migration; and
the 2–3 promoted widgets each meet definition-of-done without introducing hand-authored knowledge that A1
would later force a re-author of.

---

## Risks & anti-goals

- **Anti-goal:** _mass front-loading_ all 28 stub widget manifests (or a large batch of new artifacts)
  against a pre-A1 schema — that multiplies the very duplication A1 removes (`§XI.4`). Continuous,
  incremental artifact improvement is **encouraged**; banking deep, soon-to-change manifest knowledge in
  bulk is the anti-goal.
- **Anti-goal:** a knowledge graph / vector DB / workflow engine now — premature (`§ "Deliberately NOT
recommended yet"`). Simple indexing first; add infra only if it demonstrably fails.
- **Risk:** the generator can't losslessly reproduce hand-authored nuance → mitigate by piloting on 5–10
  components and diffing before mass migration.
- **Risk:** held-out corpus leaks into knowledge authoring → enforce author separation as _process_
  (A3.3), not just code.
- **Risk:** behavioral graders stay SSR-only → commit to the real browser in A3.2 or cut render-smoke.
- **Risk:** the two tracks drift out of sync (artifacts authored against schema the platform later
  changes) → the Track-B sequencing note + rule 6 are the mitigation; review artifact depth against the
  current platform stage at each milestone.
