# WakeCore — Final Architecture (pre-implementation)

> The last architecture document before implementation. It **refines, consolidates, and clarifies** —
> it does not expand. It incorporates the lessons from every pilot (Button manifest, builder
> walkthrough, and the working flywheel slice). Read alongside `WAKECORE-ARCHITECTURE.md` (the full
> blueprint); **where this doc refines the blueprint, this wins.**
>
> **Rule honored throughout:** no new systems were invented here. Two of these four refinements
> *remove* concepts (Lineage absorbs three; the manifest family collapses three knowledge shapes into
> one). The architecture got *smaller*, not bigger.

---

## 1. Two complementary architectures (make the split explicit)

The blueprint's "two axes" actually mixed two different kinds of thing. Separate them cleanly — one is
**nouns**, the other is **verbs**:

### A. Artifact Architecture — *what exists* (the object hierarchy)
```
Tokens → Components → Widgets → Templates → Flows
```
A containment/composition hierarchy. Static. Each tier is composed of the tier below it. This is the
**vocabulary** WakeCore offers. (Defined per-tier in the blueprint §IV; unchanged.)

### B. Runtime Architecture — *what happens* (the execution lifecycle)
```
Intent → Knowledge Retrieval → Artifact Selection → Instance Creation
       → Rendering → Evaluation → Learning → Knowledge Update ↺
```
A loop. Dynamic. It runs *over* the artifact hierarchy to produce a page and improve the knowledge. The
flywheel slice executed exactly this lifecycle, once, top to bottom, and closed it.

**Why separate them:** they change for different reasons and at different speeds. The artifact
hierarchy grows when WakeCap needs new building blocks; the runtime lifecycle is fixed and reused at
every tier. Conflating them (as "four layers" or "two axes") hid that the lifecycle is the *same* whether
you're selecting a component, a widget, or a flow. **The Artifact Architecture is the data model; the
Runtime Architecture is the control flow. Document and version them independently.**

---

## 2. One source of truth — the manifest family

Every artifact is described by **one manifest**, and everything else is a **projection** of it.

```
ComponentManifest                    ← authored once (generated structure + authored judgment)
WidgetManifest        the ONE         ← same family, tier-specific fields
TemplateManifest      manifest        ← (data contracts, slots, regions, dataFlow, requiredWidgets…)
FlowManifest          family          ← steps, transitions, shared state
        │
        └── PROJECTIONS (generated, never hand-authored):
              • library-index.json        (a derived catalog view)
              • narrative knowledge guides / "skills"
              • retrieval indexes
              • the eval's per-artifact knowledge
              • docs / reference
```

The Button pilot proved this is **lossless**: the current `library-index.json` Button entry regenerates
100% from a unified manifest, and the manifest is a strict superset. So the target is unambiguous:
**author manifests; generate everything else.** A fact lives in exactly one place; every other
representation is a projection that can be rebuilt and never drifts.

This is the organizing principle for Stage 1 of the roadmap. Until it holds, every other consolidation
(retrieval, lineage, learning) is fighting three copies of the truth.

---

## 3. Retrieval is two operations (the canonical model)

The flywheel slice's most concrete lesson: **retrieval is not one search.** Treating it as a single
fuzzy lookup is what broke the loop on the first run. It is two distinct operations:

```
1. INTENT MATCHING        task / intent  →  the entry artifact(s)
   (fuzzy; the hard part)  "a dashboard of KPIs"  →  org-overview template
                           — needs real text understanding; brittle under naive token overlap

2. STRUCTURAL RESOLUTION  entry artifact  →  its dependency graph
   (deterministic; trivial) org-overview → requiredWidgets[kpis]=metric-card → its providers,
                            slots, composedOf, referenced patterns
                            — a graph walk over the manifests; no guessing
```

**Canonical rule:** spend matching effort *only* on step 1; resolve everything reachable in step 2
**structurally** from the manifest graph. In the slice, the loop closed the moment widget selection was
resolved from the template's `requiredWidgets` instead of being re-retrieved by keyword. This replaces
the blueprint's single "retrieval / knowledge index" box — retrieval = **match the entry, then walk the
graph.** It also means the manifest family (§2) *is* the retrieval graph — another reason §2 comes first.

---

## 4. Knowledge Lineage — a first-class concept (that absorbs three others)

**Yes — this belongs in WakeCore, and it's the governance backbone the flywheel needs.** Every piece of
knowledge must be traceable: *why do we know this, where did it come from, which evaluation proved it,
which run discovered it, when was it last validated, is it still trusted?*

Crucially, Lineage is **not a new subsystem.** It is the maturation of fields that already exist,
consolidated:
- it **absorbs `provenance`** (where a field came from: generated / authored / mined),
- it **absorbs `knowledgeLevel`** (full/concise → becomes a derived trust state),
- it **absorbs the proposed "decision records"** (the "why we know this" node *is* a decision record).

So Lineage *reduces* concept count. It is realized as **a graph view over data we already capture**
(runs, evals, learnings, manifests) — not a new database.

### The lineage record (attached to every knowledge entry)
```jsonc
{
  "origin":      "authored | generated | mined-from-run",
  "discoveredIn":"run #91",                 // null for authored
  "producedBy":  "claude-sonnet-4-6",       // model/agent or human
  "verifiedBy":  { "eval": "#143", "heldOutTasks": 24, "passRate": 0.96 },
  "status":      "candidate | verified | accepted | stale | retired",
  "confidence":  "DERIVED from heldOutTasks × passRate × recency — never hand-set",
  "lastValidated": "2026-06-20",
  "supersedes":  null
}
```

### The two worked examples (yours, now formalized)
```
Learning "dashboards → metric-card"
   → discovered in Run #91  → produced by Claude Sonnet  → verified on Held-out Set B (passRate 0.96)
   → status: accepted  → updated: MetricCard widget knowledge  → lastValidated 2026-06-20

chooseOver "Sheet over Dialog"
   → origin: authored  → verifiedBy eval #143  → validated across 24 held-out tasks
   → confidence: derived (high)  → lastValidated 2026-06-18
```

### Why it's first-class (not optional)
- **It operationalizes the anti-pollution rule.** A learning is `accepted` only with a `verifiedBy`
  pointing at a held-out eval — lineage is *where the gate is recorded*, so "is this trusted?" is
  answerable, not assumed.
- **It makes knowledge prunable.** `stale`/`retired` + `lastValidated` let the system decay knowledge
  that no longer passes — knowledge with a lifecycle, like reviewed code.
- **`confidence` is derived, never authored** — from held-out pass-rate × breadth × recency. No magic
  numbers; the eval is the only thing that can raise confidence.

Lineage is the connective tissue between the Runtime Architecture (which *produces* evidence) and the
Knowledge it updates: every `Knowledge Update` writes a lineage record; every retrieval can filter by
`status`/`confidence`. It is the single mechanism that makes a self-improving knowledge base *safe*.

---

## 5. How the four reinforce each other (one loop, no new parts)

```
ManifestFamily (§2)  is the single source AND the retrieval graph
        │
        ├─►  Retrieval (§3): match intent → walk the manifest graph
        │
        ├─►  Runtime lifecycle (§1B) runs, producing evidence (eval results, captures)
        │
        └─►  Lineage (§4) records every knowledge write with its verifying eval + run,
                 gates acceptance on held-out proof, and feeds trust/confidence back into retrieval
```

Each refinement makes the next cheaper: one manifest family gives retrieval a clean graph to walk;
structural retrieval gives the runtime reliable dependencies; the runtime produces the evidence lineage
records; lineage's trust signal tells retrieval which knowledge to surface. The system closes on
itself **using only the parts that already exist.**

---

## 6. What this does NOT change (intentional restraint)

- **No new systems.** Flows remain the last tier; the builder runtime stays out of scope (manifests +
  a reference renderer + a conformance spec); SkillOpt stays last.
- **The dependency-ordered roadmap is unchanged** — these refinements slot into existing stages:
  manifest family = Stage 1 · retrieval split = Stage 2 · hard eval = Stage 3 · Lineage = the
  governance layer applied across Stages 3 & 6, not a stage of its own.
- **The README "four layers" is demoted to a narrative projection** of the Artifact + Runtime split —
  marketing framing, not an architectural model.

---

## 7. Implementation starts here — from these invariants

When code begins, these are the non-negotiables this document fixes:

1. **Author manifests; generate every other representation.** (`library-index.json` becomes generated.)
2. **Retrieval = intent match + structural graph walk.** Never re-discover a dependency by keyword.
3. **Every knowledge write carries a lineage record;** acceptance requires a held-out `verifiedBy`.
4. **Confidence is derived from evaluation, never hand-set.**
5. **Artifact (nouns) and Runtime (verbs) are versioned independently.**

The flywheel slice already demonstrated this end to end at n=1. Scaling it is implementation, not
architecture. **The architecture phase is closed.**
