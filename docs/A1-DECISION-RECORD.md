# A1 Decision Record — Freezing the Unified Knowledge Model

> **Status:** **ACCEPTED — schema frozen 2026-07-05** (all Part 5 questions resolved). **Stage:** Track A / A1 (`docs/PLANNING.md`).
> **Purpose:** eliminate every duplication and canonical-ownership ambiguity in the manifest model so the
> remaining A1 migration (113 artifacts) is mechanical. No components migrated here; no APIs changed.
> **Companion of:** [`PLANNING.md`](./PLANNING.md) (roadmap), [`CORE-NEXT.md`](./CORE-NEXT.md)
> (one-manifest-family principle), [`TIER-ARCHITECTURE.md`](./TIER-ARCHITECTURE.md) (manifest schemas).

---

## Part 1 — Architectural review (as-is)

### 1.1 The knowledge sources today

| Source | Kind | Owns | Consumed by |
|---|---|---|---|
| `packages/components/src/*` (code) | authored | the components themselves | everything |
| `scripts/catalog-structural.json` (gen from cva) | generated | `variants`, `sizes`, `path`, `import` | catalog sync |
| `eval/contracts/component-api.json` (gen from `.d.ts`) | generated | prop **types** (`props{}`) | eval contracts arm |
| `eval/contracts/overlay.json` | **hand-authored** | `forbiddenProps`, `commonMistakes{wrong,why,right}`, `minimalExample` | eval contracts arm |
| `library-index.json › components[]` | **hand-authored** (pilot: 6 projected) | catalog semantics + `patterns[]` | agents, skills, eval graders |
| `library-index.json › patterns[]` | **hand-authored** | 9 composition recipes | `eval/lib/prompts.mjs`, `eval/ablation.mjs` |
| `manifests/*.{component,widget,template}.json` | **hand-authored** | full artifact knowledge | manifest validators; (pilot) catalog projection |
| `skills/**`, `domain_map.yaml` (`fm-*`) | hand-authored | narrative + failure-mode exemplars | agents; failure-mode grader |

**The core problem:** the same semantic fact can live in up to **four** places (manifest, `library-index`
entry, `overlay.json`, `domain_map.yaml`) under **different field names and shapes**, with nothing
forcing them to agree. The pilot proved DataTable's `intent`/`chooseOver` had already silently diverged
between its widget manifest and the catalog.

### 1.2 The duplication map (measured)

| # | Concern | Representations found | Verdict |
|---|---|---|---|
| D1 | "prefer this over X" | `chooseOver.component` (component) vs `chooseOver.over` (widget/template) | rename → `component` |
| D2 | "what not to do" | `avoid` (str[]) · `commonMistakes{mistake,symptom,fix}` (widget/tpl) · `overlay.commonMistakes{wrong,why,right}` · `forbiddenProps` · `fm-*` | canonicalize `commonMistakes`; generate `avoid` |
| D3 | dependencies | `requires` (comp/cat) vs `requiredProviders` (widget/tpl) vs `composedOf` vs `requiredWidgets`/`requiredComponents` | split: providers vs composition; `composedOf` generated |
| D4 | grouping | `manifest.category` vs catalog bucket array (two vocabularies) | `category` canonical; bucket generated |
| D5 | maturity/trust | `knowledgeLevel` vs `lineage.status` + `confidence`; `manifestStatus` also in `lineage.manifestStatus` | lineage canonical; `knowledgeLevel` generated |
| D6 | composition recipes | `patterns[]` (light) vs template manifests (full) | pattern manifests; project to `patterns[]` |
| D7 | prop knowledge | `component-api.json` (gen types) vs `configSchema`/`dataContract` (hand types) vs `overlay` | types generated; manifest attaches notes |
| D8 | alternatives | `chooseOver` vs `insteadUse` (inverse framings) | keep `chooseOver` canonical; `insteadUse` reciprocal |
| D9 | provenance | `lineage` has 8 / 19 / 15 keys across the three tiers; ad-hoc keys everywhere | standardize one `lineage` schema |
| D10 | schema hygiene | stray `TODO{}` (28 stub widgets), `_note_*` (templates) | formalize `stub` + `notes` |
| D11 | variants | `variants`/`sizes` (gen) vs `variantIntent` (semantic) | keep split; formalize `variantIntent` |
| D12 | inputs | `dataContract` (data) vs `configSchema` (config) | complementary, NOT dup — validate types vs D7 |
| D13 | audit residue | catalog `tierCandidate`/`tierReason`/`needsDecision` (2 entries) | move to `lineage`; drop from catalog |

---

## Part 2 — Decision Record

Each decision states the canonical vs generated representation, the migration strategy, whether backward
compatibility is required, and whether it is a **schema change** or a **temporary projector adapter**.

> **Global compatibility rule (applies to all).** External/eval consumers read the **catalog projection
> and `patterns[]`**, not the manifests. Therefore the **manifest schema may change freely** (internal),
> but the **catalog projection must keep emitting the field names the eval graders already read**:
> `chooseOver[].component`, `requires`, `avoid`, and `patterns[]`. Manifest-side renames are bridged by
> the projector during migration and the adapter is retired at the final flip.

---

### D1 — `chooseOver.over` → `chooseOver.component`
- **Problem.** Component manifests use `{component, because}`; widget/template use `{over, because}`. Two shapes for one relation; the pilot projector already carries an `over→component` adapter.
- **Alternatives.** (a) Standardize on `component`. (b) Standardize on `over`. (c) Keep the adapter forever.
- **Recommendation.** (a) — rename `over`→`component` in all widget/template manifests.
- **Why.** `component` is self-describing and already the catalog/eval-facing name; retiring the adapter removes a permanent translation layer.
- **Migration impact.** Mechanical rename in 8 template + 33 widget manifests (many are stubs without `chooseOver`). Projector keeps the adapter until the rename lands, then it's deleted.
- **Risks.** Low. A validator asserts no `over` key remains post-migration.
- **Future implications.** One relation name across all tiers; simpler retrieval graph.
- **Change type.** Schema change; projector adapts temporarily.

### D2 — Canonicalize `commonMistakes`; generate `avoid`; fold `overlay`
- **Problem.** "What not to do" exists as `avoid` (terse str[]), two different `commonMistakes` shapes (`{mistake,symptom,fix}` in manifests, `{wrong,why,right}` in `overlay.json`), `forbiddenProps`, and `fm-*` exemplars.
- **Alternatives.** (a) Keep all, accept drift. (b) One structured `commonMistakes`; derive `avoid`; fold `overlay`; reference `fm-*` by id. (c) Collapse everything into `fm-*` only.
- **Recommendation.** (b). Canonical = manifest `commonMistakes[] {mistake, symptom, fix, ref?}` where `ref` points at an `fm-*` id. `avoid` (catalog) is **generated** as a one-line projection (`mistake → fix`, plus any `ref`). `overlay.json.commonMistakes{wrong,why,right}` maps into the same structure (`wrong→mistake`, `why→symptom`, `right→fix`). `fm-*` remains the deep exemplar library, referenced, not restated.
- **Why.** One authored source, terse catalog heuristic generated from it, and the eval's rich exemplars stay linked by id — matches the memory rule *"avoid stays SHORT; deep mistakes live in domain_map/skills."*
- **Migration impact.** Fold `overlay.json` per-component knowledge into the component manifests; `avoid` stops being hand-authored. Widget manifests that gained `avoid` in the pilot (DataTable) regenerate it from `commonMistakes`.
- **Risks.** Medium — `avoid` one-liners are currently hand-crafted; auto-generation may read worse. Mitigate: allow an optional authored `avoidOverride` string; generation is the default.
- **Future implications.** `forbiddenProps` becomes a `configSchema` constraint (see D7); `overlay.json` is retired.
- **Change type.** Schema change (fold) + generated projection.

### D3 — Split dependencies: providers vs composition
- **Problem.** `requires`, `requiredProviders`, `composedOf`, `requiredWidgets`/`requiredComponents` overlap by name but mean different things.
- **Analysis.** Two distinct relations are conflated: **provider dependency** (React context an artifact needs — `Toaster`, `SidebarProvider`) and **composition** (what an artifact is built from). `requires`≡`requiredProviders` (same thing, two names). `composedOf` = flat "built from"; template `requiredWidgets`/`requiredComponents`/`optionalWidgets` = the region-scoped composition contract.
- **Recommendation.**
  - Providers: canonical manifest field **`requiredProviders`**; catalog projection keeps emitting **`requires`** (eval provider-wiring grader reads it). Retire the manifest `requires` alias.
  - Composition: template `composedOf` becomes **generated** = rollup of `requiredWidgets ∪ optionalWidgets ∪ requiredComponents`. For widgets/components (no regions), `composedOf` stays **authored**.
- **Why.** Removes the provider double-name; makes `composedOf` a derived rollup (no drift between it and the structured requirement fields).
- **Migration impact.** Rename `requires`→`requiredProviders` in component manifests; generate `composedOf` for templates. Projector emits catalog `requires` from `requiredProviders`.
- **Risks.** Low–medium — must confirm provider-wiring grader path; keep catalog `requires` name.
- **Future implications.** Clean provider graph for A2 structural resolution; `composedOf` is trustworthy because generated.
- **Change type.** Schema change (providers) + generated (`composedOf`); projector bridges the catalog name.

### D4 — `category` canonical; catalog bucket generated
- **Problem.** `manifest.category` (widget vocab: `data`/`activity`/`workspace`; component: bucket) duplicates the catalog bucket array (`primitives`/`layout`/`overlay`/`feedback`/…). Two taxonomies.
- **Alternatives.** (a) Bucket canonical (drop `category`). (b) `category` canonical; bucket generated via a `category→bucket` map. (c) Make bucket == category (one vocabulary).
- **Recommendation.** (b) with a documented `category→bucket` map, and unify the vocabularies over time toward (c). `category` is the single authored grouping; the projector places the entry in the bucket the map yields.
- **Why.** The bucket is a *view*; deriving it from `category` removes the "entry lives in array X but says category Y" divergence.
- **Migration impact.** Define the `category→bucket` map; projector relocates entries by category. Reconcile the widget category vocab (open question Q3).
- **Risks.** Medium — moving entries between buckets changes `library-index` structure and story/nav grouping; do it once, atomically.
- **Future implications.** Single grouping taxonomy feeds Storybook nav + retrieval.
- **Change type.** Schema (category canonical) + generated bucket placement.

### D5 — Lineage canonical for maturity; `knowledgeLevel` + `manifestStatus`-in-lineage generated/removed
- **Problem.** `knowledgeLevel` (`full`/`concise`/`generated`/`needs-review`) conflates authoring-completeness with trust; `lineage.status` + derived `confidence` already model lifecycle + trust; `manifestStatus` is duplicated into `lineage.manifestStatus` on widgets.
- **Recommendation.** `lineage.status` (candidate→verified→accepted→stale→retired) + derived `confidence` are canonical for trust. `manifestStatus` (`complete`/`stub`) stays **top-level only** — remove `lineage.manifestStatus`. `knowledgeLevel` becomes a **generated completeness marker** from `manifestStatus` + semantic-field richness (`full`/`concise`/`generated`), kept **distinct** from lineage trust (`status`/`confidence`) — the two are different axes (resolved Part 5 §9; no programmatic consumer breaks).
- **Why.** One lifecycle source; `confidence` stays derived (never hand-set) per `CORE-NEXT`.
- **Migration impact.** Drop `lineage.manifestStatus`; generate `knowledgeLevel`. Author `lineage.status` on every manifest.
- **Risks.** Low, pending Q9 (who reads `knowledgeLevel`).
- **Future implications.** Feeds the A5 learning-flywheel gate (status transitions).
- **Change type.** Schema (remove dup) + generated (`knowledgeLevel`).

### D6 — `patterns[]` become pattern manifests
- **Problem.** `patterns[]` (9 recipes: `name/intent/when/components/order/requires/notes/tags`) is a lighter parallel to template manifests, hand-authored in `library-index`, injected into eval prompts.
- **Recommendation.** Promote to `manifests/*.pattern.json` (`tier:"pattern"`, same family). Projector regenerates `library-index.patterns[]` unchanged for the eval. Reclassifying individual patterns into templates (e.g. `app-shell`) is deferred to Track B (Q5).
- **Why.** Brings the last hand-authored `library-index` island under the one-manifest-family rule.
- **Migration impact.** 9 pattern manifests; projector emits `patterns[]`. Eval prompt code unchanged (reads the projection).
- **Risks.** Low — keep `patterns[]` output byte-stable for the eval.
- **Change type.** Schema (new `pattern` profile) + generated `patterns[]`.

### D7 — Prop types generated; `configSchema`/`dataContract` attach notes only
- **Problem.** `component-api.json` (generated prop types from `.d.ts`) and hand-authored `configSchema`/`dataContract` (which re-type props with `note`s) both describe props; `overlay.json` adds `forbiddenProps` + `minimalExample`.
- **Recommendation.** `component-api.json` is the canonical **generated** prop-type source. `configSchema`/`dataContract` keep only the authored *semantics* (`note`, `required`-intent, `slots`, `rowIdentity`) and are **validated** so every key exists in `component-api` props (no re-typing). `forbiddenProps` → a `configSchema` constraint. `minimalExample` lives once on the manifest.
- **Why.** Types come from code (single structural source); manifests add only what types can't express.
- **Migration impact.** Add a validator linking `configSchema`/`dataContract` keys to `component-api` props; fold `overlay` `forbiddenProps`/`minimalExample` into manifests; retire `overlay.json`.
- **Risks.** Medium — `component-api.json` must cover all 118 (currently pilot-scoped); generating it fully is a prerequisite.
- **Change type.** Schema (fold overlay) + generated types + validation link.
- **Status (2026-07-05, post-flip).** DEFERRED — the catalog flip is complete without this. On
  implementation it emerged that `component-api.json` + `overlay.json` are **export-keyed** (16 exports,
  including sub-exports `FormField`/`FormControl`/`ChartContainer` that are *not* catalog artifacts and
  have no manifest home), and are consumed directly by the eval's contracts arm. Folding them into the
  artifact-keyed catalog manifests is a granularity mismatch, and it collides with the `avoid`-derived
  `commonMistakes` already on the manifests (a byte-stable regeneration would need per-entry source tags).
  This is a **separate, eval-coupled slice** — either (a) manifest the exports (incl. sub-exports) and
  generate `overlay.json` from them, or (b) treat the contracts as a distinct export-level layer and point
  the eval at a generated projection. Not a blocker for A1's catalog single-sourcing.

### D8 — `chooseOver` canonical; `insteadUse` kept as the reciprocal
- **Problem.** `chooseOver{component,because}` ("prefer this over X") and `insteadUse{whenInstead,component}` ("defer to X here") are inverse framings of the alternatives relation.
- **Recommendation.** Keep `chooseOver` as the canonical directional relation. Retain `insteadUse` as an authored "defer-to" (distinct intent), and add a validator that flags non-reciprocal pairs (if Dialog `insteadUse` Sonner, Sonner should `chooseOver` Dialog). Full unification into one `alternatives[]` is deferred (Q4).
- **Why.** Both framings carry real intent; forcing a merge now risks losing nuance. Reciprocity validation catches drift cheaply.
- **Migration impact.** None to data; add a lenient (warn) reciprocity check.
- **Risks.** Low.
- **Change type.** No schema change now; validator only.

### D9 — One `lineage` schema
- **Problem.** `lineage` has 8/19/15 keys across tiers with ad-hoc fields (`composes`, `unblocks`, `notAdoptedBy`, `reclassificationNote`, `archetypeNote`, …).
- **Recommendation.** Freeze `lineage = { origin, authoredBy, derivedFrom{source, extracted[]}, status, verifiedBy, confidence, supersedes, lastValidated, notes[] }`. Everything non-standard collapses into `notes[]` (freeform) or an existing field. `confidence` is derived, never authored.
- **Why.** Lineage is the backbone of the A5 flywheel and Q-lineage in `CORE-NEXT`; it must be uniform to be queryable.
- **Migration impact.** Normalize lineage in all existing manifests (8 template + 33 widget + 5 component); a schema validator enforces the key set.
- **Risks.** Low — information preserved via `notes[]`.
- **Change type.** Schema change (normalize).

### D10 — Formalize the stub + notes shape
- **Problem.** 28 stub widgets carry an informal `TODO{}` map; templates carry `_note_*` keys.
- **Recommendation.** Replace `TODO{}` with `manifestStatus:"stub"` + an optional `stubPlan[]` (the list of fields still to author). Replace `_note_*` with `notes[]` (or fold into `commonMistakes`). A validator forbids unknown top-level keys.
- **Why.** Removes ad-hoc keys; makes "stub" a first-class, checkable state.
- **Migration impact.** Rewrite `TODO`→`stubPlan` in 28 stubs; drop `_note_*`.
- **Risks.** Low.
- **Change type.** Schema change.

### D11 — Keep `variants`/`sizes` generated; formalize `variantIntent`
- **Problem.** `variants`/`sizes` are structural (cva-extracted); `variantIntent` is semantic and component-only.
- **Recommendation.** No change to the split. Formalize `variantIntent` as an optional component-tier field in the frozen schema; the projector validates its keys against the extracted `variants`.
- **Why.** Clean structural/semantic boundary already holds; only needs formalizing + a keys-match validator.
- **Change type.** Schema formalization + validation.

### D12 — `dataContract` vs `configSchema` are complementary (not a duplication)
- **Problem.** Both look like "inputs."
- **Recommendation.** Keep both. `dataContract` = the **data** the artifact binds (`input`, `rowIdentity`, `slots`); `configSchema` = **behavior/config props**. Their prop types are validated against `component-api.json` (D7). Document the boundary in the schema.
- **Change type.** Documentation + validation link; no field change.

### D13 — Retire catalog audit residue into lineage
- **Problem.** `tierCandidate`/`tierReason`/`needsDecision` sit on 2 catalog entries (PropertyList, ZoomTools).
- **Recommendation.** Move into `lineage` (`status:"candidate"`, `notes[]`) on those artifacts' manifests; drop from the catalog projection.
- **Change type.** Schema (move) — trivial footprint.

---

## Part 3 — The frozen schema (`artifact-manifest/0.2`)

Bump `schemaVersion` `0.1 → 0.2`. **Field ownership** (the freeze):

| Field | Tiers | Owner / source | In catalog projection as |
|---|---|---|---|
| `schemaVersion,id,tier,name,version` | all | manifest (authored); `version` baseline `1.0.0` | `name`, `tier` |
| `category` | all | manifest (authored) | bucket (generated placement) |
| `source{path,import,export}` | all | **generated/verified** vs exports | `path`, `import` |
| `variants,sizes` | comp | **generated** (cva) | `variants`, `sizes` |
| `props{}` (types) | all | **generated** (`component-api.json` from `.d.ts`) | — (used by graders) |
| `tags,intent,when,whenNot` | all | manifest (authored) | `tags,intent,when` |
| `chooseOver[]{component,because}` | all | manifest (authored) | `chooseOver` |
| `insteadUse[]` | comp | manifest (authored) | `insteadUse` |
| `pairsWith[]` | all | manifest (authored) | `pairsWith` |
| `requiredProviders[]` | all | manifest (authored) | `requires` (compat name) |
| `requiredWidgets/optionalWidgets/requiredComponents/missingRequiredWidgets/impliedWidgets` | template | manifest (authored) | — |
| `regions[]` | template | manifest (authored) | — |
| `composedOf[]` | widget/comp authored · template **generated** rollup | — | — |
| `dataContract` | widget/template | manifest (authored) + types validated vs `props` | — |
| `configSchema` | widget/template | manifest (authored) + types validated vs `props`; hosts `forbiddenProps` | — |
| `states` | widget/template | manifest (authored) | — |
| `commonMistakes[]{mistake,symptom,fix,ref?,prop?,badValue?,avoidOverride?}` | all | manifest (authored, canonical); hosts folded `forbiddenProps` via `prop`/`badValue` | `avoid` (**generated**, or `avoidOverride`) |
| `minimalExample` | all | manifest (authored, single home) | — |
| `variantIntent{}` | comp | manifest (authored); keys validated vs `variants` | `variantIntent` |
| `subcomponents[]` | comp | manifest (authored) | `subcomponents` |
| `allowedPlacement/forbiddenPlacement/responsive/dataFlow/dataSources/archetype/evaluationCriteria` | widget/template | manifest (authored) | — |
| `manifestStatus` | all | manifest (authored: complete/stub) | `manifest`, `manifestStatus` |
| `stubPlan[]` | all (when stub) | manifest (authored) | — |
| `knowledgeLevel` | — | **generated** from `manifestStatus` + field richness (≠ trust) | `knowledgeLevel` |
| `lineage{origin,authoredBy,derivedFrom,status,verifiedBy,confidence,supersedes,lastValidated,notes[]}` | all | manifest authored; `confidence` **derived** | — |

Everything not in this table is disallowed at the top level (a `no-unknown-keys` validator enforces it).
Retired: `over`, manifest `requires`, `lineage.manifestStatus`, `TODO`, `_note_*`, catalog
`tierCandidate/tierReason/needsDecision`, `overlay.json`.

---

## Part 4 — Migration plan for the remaining 118 artifacts

**Principle:** the manifest becomes the source; `library-index.json` + `patterns[]` become the generated
projection; CI enforces they cannot diverge. Migration is batched, gated, and reversible.

### 4.1 Order (leaves → roots → recipes → flip)
1. **Schema + tooling first** (no data migration): adopt `0.2`, generate `component-api.json` for all 118, write the `no-unknown-keys` + type-link + reciprocity validators, extend the projector for D1–D6 (adapters on).
2. **Components (73):** decision-heavy `full` (already 5) → remaining `full` → `concise` (67) → `generated`/stub. Leaves first — they have no composition dependencies.
3. **Widgets (33):** complete (5) → the 28 stubs (`TODO`→`stubPlan`, rename `over`, `requires`→`requiredProviders`).
4. **Templates (13→ manifests 8 + 5 instances):** rename `over`, generate `composedOf`, normalize lineage.
5. **Patterns (9):** author `*.pattern.json`; project `patterns[]`.
6. **Contracts fold:** move `overlay.json` into manifests; retire it.
7. **Final flip:** `library-index.json` becomes 100% generated; `--check` gates every entry.

### 4.2 Batching
- Batches of **~10–15 artifacts by category bucket** (coherent review, small diffs).
- Each batch: `scaffold from library-index → author lineage.status + fixups → generate:catalog → validate → commit`. Reuse the pilot scaffold; one commit per batch (rollback unit).

### 4.3 Validation gates (every batch, all must pass)
- `validate:manifests` (schema + `no-unknown-keys` + projection equality)
- `project-catalog-manifests --check` (in sync)
- `validate:catalog` (0 errors)
- widget + template manifest validators (0 errors)
- type-link validator (`configSchema`/`dataContract` keys ∈ `component-api` props)
- `pnpm storybook:build`
- (unchanged) eval **ablation numbers stable** on a spot task — knowledge round-trip lost nothing.

### 4.4 Rollback
- Per-batch commit → `git revert` restores the prior projected `library-index`.
- Tag `a1-premigration` before batch 1; the pre-flip catalog is always one tag away.
- Because `library-index` stays committed as the projection throughout, every intermediate state is a valid, buildable repo.

### 4.5 CI sequence
1. **Before batch 1:** add `validate:manifests` + `project --check` to the **`catalog-integrity`** job (hard gate). Now any drift or hand-edit to a migrated entry fails the PR.
2. **During:** each batch PR runs the full gate set (4.3). Chromatic/story builds unaffected (no story/component changes).
3. **At the flip:** `--check` scope = 100% of entries; a hand-edit to `library-index` anywhere fails CI.

### 4.6 The final flip
- Preconditions: all 118 have catalog-complete manifests; `patterns[]` projected; `overlay.json` folded; projection == catalog for **every** entry.
- Actions: (a) generator emits the **entire** `library-index.json` (all entries + `patterns[]`) from manifests + extractors; (b) add a generated-file header banner; (c) `--check` covers 100%; (d) retire all projector adapters (D1/D3 renames now complete); (e) delete `overlay.json`.
- `library-index.json` **stays committed** (consumers read it) but is now a pure build artifact under CI `--check`. (Gitignoring it is Q7.)

---

## Part 5 — Resolved decisions (closed 2026-07-05)

All nine questions are decided. These lock the freeze.

1. **Provider field name → `requiredProviders`.** Canonical manifest field is `requiredProviders`; the catalog projection still emits `requires` (eval grader compat). Migration: rename `requires`→`requiredProviders` in the 5 component manifests; widget/template already use it.
2. **`avoid` → generated, with override.** `avoid` is generated from `commonMistakes` (`mistake` + `fix` + any `ref`); an optional `avoidOverride` on a `commonMistakes` entry supplies hand-tuned phrasing when needed.
3. **Category → `category` canonical + `category→bucket` map.** `category` is the single source; the projector derives the catalog bucket via a documented map. Unifying the two vocabularies (widget `data/activity/workspace` vs buckets) is deferred to a **Track B IA workstream** — no Storybook nav churn during A1.
4. **`insteadUse` → kept + reciprocity validator.** `chooseOver` stays canonical; `insteadUse` retained as the distinct "defer-to"; a lenient validator warns on non-reciprocal pairs.
5. **Patterns → all `tier:pattern`.** All 9 authored uniformly as `*.pattern.json`; `library-index.patterns[]` projected byte-stable for the eval. Any pattern→template promotion is a per-pattern **Track B** decision.
6. **`forbiddenProps` → folded into `commonMistakes`.** Modeled as a `commonMistakes` entry with optional machine-checkable `prop`/`badValue`. One "what not to do" home (aligns D2); works on every tier; still grader-enforceable. `overlay.json` retired.
7. **`library-index.json` at the flip → stays committed, CI-enforced.** Remains in git as the generated projection with a generated-file banner; `project --check` hard-gates drift; consumers read it directly and PR diffs stay reviewable.
8. **Versioning → `0.2` + `version` required on all tiers.** `schemaVersion` bumps to `artifact-manifest/0.2`; every manifest (component/widget/template/pattern) carries a per-artifact `version` (baseline `"1.0.0"`) — the anchor for A4.4 deprecation/migration and `lineage.supersedes`.
9. **`knowledgeLevel` → generated from completeness, separate from trust.** Derived from `manifestStatus` + semantic-field richness (`full` = has chooseOver/when/commonMistakes; `concise` = intent-level; `generated` = stub). Trust stays in `lineage.status`/`confidence` (the two axes are kept distinct). Confirmed safe: no programmatic consumer reads it — only the Storybook catalog UI + `SKILL.md`, both of which read the still-present projected field.

---

## Part 6 — Track B continuous workstreams (review)

The current `PLANNING.md` Track B lists a per-artifact **definition-of-done**. This review identifies the
**cross-artifact, never-"done" workstreams** that should run continuously — each tied to a platform
mechanism that *measures* it (so they're gates, not aspirations). Only workstreams justified by the
existing architecture are included.

| Continuous workstream | Applies to | Measured / enforced by | Why it's continuous |
|---|---|---|---|
| **API consistency & genericity** | components, widgets | `component-api.json` diff + the "could ship in shadcn?" boundary test | the floor's stability; the component/widget line is re-tested as artifacts evolve |
| **Accessibility** | all | A3.2 **axe grader** (real browser) | new variants/states regress a11y; must be re-checked every change |
| **Performance & bundle size** | all | build size report per artifact; render cost | agents ship this to consumers; regressions compound |
| **Visual consistency** | widgets, templates | Chromatic visual proof (deterministic snapshots) | every artifact/token change can shift rendering |
| **Test coverage** | components, widgets | Vitest browser tests + screenshot baselines | behavior must stay pinned as artifacts change |
| **AI usability (knowledge quality)** | all | eval graders (selection/composition/failure-mode) + manifest completeness | the product metric; each artifact's manifest quality is continuously scored |
| **Documentation freshness** | all | **generated** from manifests (A1) | docs can't go stale if generated; the workstream is keeping generation lossless |
| **Versioning, deprecation & migration** | all | A4.4 version→instance propagation; `lineage.status` (`stale`/`retired`) | artifacts get superseded; deprecation + migration is ongoing, not one-time |
| **Adoption** | widgets, templates, flows | composition graph (which templates/flows use an artifact) + eval task coverage | promotion/retirement decisions need live adoption signal |

**Recommendation for the roadmap:** add these as a **"Continuous cross-artifact workstreams"** subsection
under Track B (distinct from the per-artifact definition-of-done), each pointing at the platform mechanism
that scores it. Do **not** add workstreams without such a mechanism — e.g. "genericity" is justified
(boundary test exists), but a standalone "developer experience" workstream is not (no measurement) and is
excluded.
