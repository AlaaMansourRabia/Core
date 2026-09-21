# Pilot: "One Component, One Manifest" (Button)

> **Architecture-validation pilot. Design-only, zero-cost.** No generators, no `library-index.json`
> changes, no package code, no widgets/templates, no evals. The deliverable is a strawman manifest
> (`button.manifest.json`) + this analysis. Question it answers: **can Core move to a single
> unified artifact-manifest model — before we build widgets/templates?**

## 1. Goal & why Button

**Goal:** prove that the three things Core currently knows about a component — its *generated
structure*, its *authored semantics*, and its *prop/type contract* — can collapse into **one
source-of-truth manifest** from which today's `library-index.json` entry is a lossless *projection*,
and whose skeleton **aligns with the widget/template manifest family**. If that holds for one
component, the Stage-1 "Uniform Knowledge" consolidation in the architecture blueprint is real and
safe to scale.

**Why Button:**
- It's the **most-exercised, best-understood** component (it appears in our eval tasks, captures, and
  the contracts pilot), so the data is real, not invented.
- It is **non-trivial in exactly the right way** — it has multiple variant axes (`variant` × `size` ×
  `icon`), authored variant semantics, a known failure mode (`size="icon"`), and a navigation
  decision (`asChild` + Link). That exercises every field family without being a hard data-bearing
  case. (The harder case — a data-bearing component like `DataTable` — is deliberately *out* of this
  pilot; see §5, it's the next thing to test.)
- All three current sources already have real Button data, so the projection proof is verifiable, not
  hypothetical.

**How it validates the larger architecture:** the blueprint's most load-bearing assumption (§II, §X)
is *"unify components into the same manifest family as widgets; `library-index.json` becomes
generated, not authored."* Everything downstream — retrieval, tier expansion, the learning store —
assumes knowledge has **one shape**. This pilot is the cheapest possible test of that assumption.

## 2. The strawman

See [`button.manifest.json`](./button.manifest.json). It merges, with per-field **provenance**
(`generated` / `authored` / `inferred`):

- **generated** (from source / CVA / `.d.ts`): `id`, `name`, `source.*`, `description`, `props`,
  `variants[].axis|id|default`, `requiredProviders`.
- **authored** (irreducible judgment): `intent`, `when`, `chooseOver`, `avoid`, `tags`, `pairsWith`,
  `variants[].intent`, `forbiddenProps`, `commonMistakes`, `minimalExample`, `evaluationCriteria`,
  `knowledgeLevel`, `tier`.
- **inferred** (derivable, not a primary source): `category` (from the component's grouping).

**One consolidation the manifest surfaces immediately:** today the same concept — "enumerable design
axes" — is stored **five ways** (`variants:[]` + `sizes:[]` + `otherAxes:{}` + `defaultVariants:{}` in
structural, plus `variantIntent:{}` in the index). The manifest collapses all five into one
`variants: [{ axis, id, default?, intent? }]`. That's a real simplification the unified model *buys*,
not just a reshuffle.

## 3. Projection proof — regenerate the `library-index.json` Button entry

Every field in the current index entry is derivable from the manifest:

| `library-index` field | Regenerated from manifest | Lossless? |
|---|---|---|
| `name`, `path`, `import` | `name`, `source.path`, `source.import` | ✓ |
| `variants` (flat array) | `variants[] where axis="variant"` → map to `id` | ✓ |
| `sizes` (flat array) | `variants[] where axis="size"` → map to `id` | ✓ |
| `variantIntent` (map) | `variants[] where axis="variant"` → `{id: intent}` | ✓ |
| `tags` | `tags` | ✓ |
| `knowledgeLevel` | `knowledgeLevel` | ✓ |
| `intent`, `when`, `avoid` | same fields | ✓ |
| `chooseOver` | `chooseOver` (rename `over`→`component`) | ✓ |
| `requires` | `requiredProviders` | ✓ |
| `pairsWith` | `pairsWith` | ✓ |

**Result: 100% of the index entry regenerates. Zero information loss** going manifest → index.

**Fields that cannot be regenerated:** none *into* the index. The reverse is the point — the manifest
is a **superset**: it additionally carries `props`, `description`, `defaultVariants`/`icon` axis,
`forbiddenProps`, `commonMistakes`, `minimalExample`, `states`, `evaluationCriteria`. The index is a
*lossy projection* of the manifest, which is correct: the index becomes a derived **view**, the
manifest the **source**. (Trivial transforms only — splitting one `variants[]` into the index's
`variants`/`sizes`/`variantIntent` triple, and a key rename. No semantic loss.)

**One honest caveat:** the manifest stores `variant`/`size`/`icon` in *both* `props` (type truth) and
`variants` (design-axis + intent). That's a deliberate, small redundancy — props are the typed API,
variants add design intent — but it's the one spot where the unified model isn't perfectly DRY. A
generator could derive the `variants[].id`s from the `props` enums and only author the `intent`s.
**[DECISION]** for scale-up: keep both, or make `variants` reference `props`.

## 4. Tier-alignment check (vs the widget manifest family)

Comparing the Button (component) skeleton to the widget manifest (`TIER-ARCHITECTURE.md §3`):

**Shared spine (identical fields, both tiers):**
`id` · `tier` · `name` · `category` · `version` · `schemaVersion` · `intent` · `when` · `chooseOver` ·
`variants` · `requiredProviders` · `states` · `commonMistakes` · `minimalExample` ·
`evaluationCriteria` · `knowledgeLevel` · `provenance`

→ **~17 shared fields.** The skeletons are the *same shape*; that's the result the pilot was testing.

**Component-only:**
- `props` (raw typed API — a component's *whole* configurable surface)
- `source.path` / `description` (source-derived)
- `avoid`, `tags`, `pairsWith`, `forbiddenProps` (component-level guidance; could generalize up but earn their place at the component tier)

**Widget/template-only:**
- `dataContract` (components have **no** domain data; widgets do — *this is the component↔widget line*)
- `configSchema` (a widget's curated presentational config — distinct from a component's raw `props`)
- `slots`, `composedOf`, `allowedPlacement` (widget)
- `layout`, `regions`, `dataSources`, `dataFlow`, `responsive`, `requiredWidgets` (template)

**The clean conceptual mapping the alignment reveals:**

| concept | component | widget | template |
|---|---|---|---|
| configurable surface | `props` (raw API) | `configSchema` (curated) | region/widget config |
| data | *(none)* | `dataContract` | `dataSources` + `dataFlow` |
| what it's made of | `composedOf` (primitives) | `composedOf` (components) | `requiredWidgets` (widgets) |
| design axes | `variants` | `variants` | — |

So the tiers don't just *share fields* — they share a **conceptual frame** (surface / data / composition /
intent) with tier-appropriate refinement. `dataContract` being widget-only is the precise, testable
definition of the component↔widget boundary the blueprint asked for: **a data contract = the line.**

## 5. Recommendation

**1. Should Core move to one unified artifact-manifest model? — Yes.** The Button case shows the
three current sources collapse with zero loss, the model *removes* an existing 5-way duplication
(variant axes), and the skeleton is genuinely the same family as widgets/templates. The unification
isn't cosmetic — it's what makes retrieval, tier expansion, and the learning store tractable later.

**2. Should `library-index.json` eventually be generated from per-artifact manifests? — Yes.** The
projection proof shows it's a lossless derived view. It should become a **generated index**, not a
hand-authored file. (Not now — no generator in this pilot — but the target is clear.)

**3. What must be true before scaling beyond Button:**
- **The data-bearing case must hold.** Test the model on **`DataTable`** next. It takes `columns`/`data`
  — i.e. it has a data-shaped surface *at the component tier*. Either (a) components may carry a light
  `dataShape` and the component↔widget line is "domain meaning," or (b) `DataTable`'s data-ness is
  exactly the signal it should be consumed *through* a widget. Resolving this on one hard component
  settles the boundary rule for everything. **This is the single most important next test.**
- **The variants↔props redundancy decision** (§3 caveat) — keep both or reference.
- **A provenance convention** agreed and applied uniformly (this pilot proposes `generated/authored/inferred`).
- **The schema is versioned** (`schemaVersion` present) so the future generator and consumers can evolve safely.
- **A generator exists** (explicitly deferred — Stage 1 work, not this pilot).

**Verdict:** the unified artifact-manifest model is **validated on Button** — lossless, simpler, and
tier-aligned. Recommend proceeding to a *second* design pilot on `DataTable` (the data-bearing case) to
settle the component↔widget boundary **before** writing any generator or authoring at scale. Do not
expand artifact tiers or build widgets until the model survives the hard case.

## Scope honored
No generators, no `library-index.json` edits, no package code, no widgets/templates, no eval runs.
Two design files only: this analysis + the strawman manifest.
