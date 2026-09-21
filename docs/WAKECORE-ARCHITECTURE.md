# WakeCore — Architecture Blueprint

> The long-term reference for what WakeCore *is becoming*, not what to build next. Written from the
> chief-architect seat. It favors simplicity over cleverness, and it challenges prior decisions where
> the evidence we've gathered says they should change. Where it contradicts an earlier doc, this
> document wins.

---

## The thesis (read this first)

**WakeCore is not a design system. It is a substrate + knowledge platform for agent-built UI.**

A design system answers *"what does WakeCap look like?"* WakeCore answers a harder, more valuable
question: *"how does a builder — human or agent — produce correct, on-brand WakeCap UI, and how does
that ability measurably improve over time?"*

The whole architecture collapses to **two orthogonal axes**:

```
        THE ARTIFACT STACK (vertical — what gets assembled)
        Tokens → Components → Widgets → Templates → Flows
            │        │           │          │         │
  ──────────┼────────┼───────────┼──────────┼─────────┼──────  THE KNOWLEDGE/LEARNING PLANE
            │        │           │          │         │         (horizontal — cuts every tier)
        Knowledge ── Evaluation ── Learning ── Improvement
```

Every artifact tier has the **same four companions**: the artifact, machine-readable **knowledge**
about it, an **evaluation** that proves agents use it correctly, and a **learning** loop that feeds
verified findings back into the knowledge. That uniformity is the most important architectural idea in
WakeCore — it's what lets the platform grow without re-inventing itself at each tier.

The README's "four layers" (UI Platform / Design Knowledge / Product Intelligence / Agent Intelligence)
are a *narrative slice* of these two axes, not a separate model. Keep the marketing framing; build to
the two-axis one.

---

## I. Where we are today (subsystem purposes & maturity)

Maturity scale: **Shipped** · **Working** (built, used, not hardened) · **Pilot** · **Designed** · **Absent**.

### The artifact stack
| Subsystem | Architectural purpose | Maturity | What "complete" needs |
|---|---|---|---|
| **Tokens** (`core-tokens`) | The single source of visual decisions (OKLCH, light/dark, TW3/TW4/no-TW). Everything above inherits brand from here. | **Shipped** | Semantic-token guidance ("which token, when") as knowledge; today it's values, not decisions agents can reason about. |
| **Components** (`core-ui`, 118) | The generic vocabulary — primitives with no domain meaning. | **Shipped** | Nothing structural. Its *knowledge* (below) is what's incomplete. |
| **Utilities** (`core-utils`) | Shared mechanics (`cn()`, etc.) the tiers depend on. | **Shipped** | Stable; minimal knowledge surface needed. |
| **Widgets** | The missing middle: configurable, domain-meaningful, schema-first units the builder instantiates. | **Designed** | Manifest schema is consumption-validated; zero authored. |
| **Templates** | Page = widgets in a layout, with data flow. | **Designed** (proto: 9 `patterns[]`) | Same; plus migrating `patterns[]` into real template manifests. |
| **Flows / Experiences** | Multi-screen journeys (see §IV — exists, needs scoping + a name). | **Absent** | Decide scope (manifest vs runtime) before anything. |

### The knowledge/learning plane
| Subsystem | Architectural purpose | Maturity | What "complete" needs |
|---|---|---|---|
| **`library-index.json`** | Structured component knowledge: intent/when/chooseOver/requires/avoid + 9 patterns. The machine-readable "why/which". | **Working** (118: 51 full / 67 concise) | Verification — most entries aren't exercised by any eval. Coverage ≠ correctness. |
| **Skills** (`SKILL.md` ×6) | The *narrative* encoding of the same knowledge for agents to read. | **Working** | Its boundary with the structured catalog is blurry (see §III). |
| **Failure modes** (`domain_map.yaml`, 27) | Encoded anti-patterns with wrong/correct exemplars. | **Working** (~9 machine-detectable) | Most are runtime/semantic and uncheckable; tie each to a grader or accept it's advisory-only. |
| **Prop contracts** (`eval/contracts`, 16) | Per-component prop/type truth, generated from `.d.ts` + authored overlay. | **Pilot** | This is actually the *correct shape for all component knowledge* (see §III) — generalize it. |
| **Evaluation framework** (`eval/ablation.mjs`) | The A0–A4 fair-baseline ladder that attributes lift to each knowledge layer, with Wilson CIs + caching. | **Working** | Held-out tasks, multi-model, a bigger/harder corpus. The harness outruns the corpus. |
| **Validators** (`scripts/validators`) | Deterministic graders (component-choice/imports/providers/failure) — also the future shippable checker. One artifact, three roles. | **Working** (trust-gated 23/23) | Clarity on which role is the source of truth (§III). |
| **Behavioral graders** (`compile`, `render`) | Move "correct" from string-match to *compiles/renders*. | compile **Working** (corrected); render **Pilot** (SSR floor) | Either commit render to a real browser or drop it — a half-grader measures the harness, not the agent. |
| **Captured runs** (`results/runs/`) | The raw exercise record — the fuel for learning. | **Working** (capture only) | The distill→verify→store half doesn't exist. Capture without distillation is just logs. |
| **Docs** (EVIDENCE / AUDIT / V2 / V3 / TIER / BUILDER / SHOWCASE / this) | The reasoning record — why decisions were made, what's proven, what's not. | **Working** | Consolidation; several overlap (§III). |

**The one-sentence state:** the *foundation* (tokens/components) and the *measurement* (eval +
validators + compile grader) are real and honest; the *upper artifact tiers* (widgets→flows), the
*learning loop* (distill/verify/store), and *knowledge at scale* (retrieval) are designed or absent.

---

## II. Architectural critique (no decisions protected)

**Elegant — keep and double down:**
- **Validators-as-graders.** One deterministic check serves eval, CI, and a future shippable package. Rare three-for-one.
- **The fair-baseline ablation.** It can *disprove its own claims* (it killed the imports lift; it caught the react-hook-form grader bug). A measurement system that catches its own errors is the platform's deepest credibility asset. This is the single best thing we built.
- **Schema-first manifests + type/instance split.** The right spine for a builder-consumable platform.

**Duplicated — consolidate:**
- **Component knowledge lives in three shapes** — `library-index.json` (authored semantics), `catalog-structural.json` (generated structure), `eval/contracts` (generated props + overlay). That's three descriptions of one component. **Collapse to one `ComponentManifest`** of the *same family* as the widget manifest (generated structure/props + authored intent/when/chooseOver + states). Components should not be a bespoke format while widgets get a clean one.
- **`patterns[]` ≈ templates.** Proto-templates in disguise. Migrate; don't maintain both.
- **Structured catalog vs narrative skills** restate the same "why" twice. Pick one source of truth (structured) and *generate* the narrative, or accept and formalize the split — but stop hand-maintaining both.

**Over-engineered / premature:**
- **Eval machinery vs corpus.** Five arms and multiple graders against ~12 author-written tasks. The harness is fine; the *corpus* is the bottleneck. More graders right now is polishing a scale no one's standing on.
- **render-smoke as it stands.** Half-built (SSR floor) — it mostly measures the harness's limitations, not the agent. Half-credit graders are worse than honest absence.
- **Doc sprawl.** 9 design docs with real overlap (V2/V3/AUDIT/EVIDENCE). Fine as a working record; needs a canonical index (this doc) so newcomers don't drown.

**Under-designed — the real risks:**
- **Retrieval / knowledge-at-scale.** Today knowledge is injected *wholesale* (~62k tokens). Add widgets + templates + flows + accumulated learnings and that model breaks. **There is no retrieval layer.** This is the most important missing system.
- **The learning store.** Capture exists; distill→verify→accept→store→retire does not. Without it, "learning" is aspirational.
- **Versioning & migration across tiers.** A token change ripples to components→widgets→templates→instances. There's no story for it.
- **Product/Flow knowledge.** ~0. The highest-value, least-captured knowledge (how WakeCap products are actually structured).

**Blurry responsibilities:**
- *Knowledge vs Skills* — who owns the canonical "why"? (Pick structured.)
- *Validator's three hats* — eval grader vs CI gate vs shipped package: same code, but the **source of truth is the eval**; the others are deployments of it. State it.
- *Does WakeCore own the builder?* Today ambiguous. **It should not** (see §IX) — it ships manifests + a reference renderer; the builder is a consumer. Owning the builder turns a platform into an app.

**Terminology to fix:**
- "Experiences" → **Flows** (Experiences is marketing; Workflows collides with CI/agent workflows).
- "Skills" (TanStack) overloads the agent-skills meaning — call WakeCore's narrative docs **knowledge guides** internally.
- "patterns[]" retires into Templates and **Product Patterns** (cross-cutting rules) — two different things share the word today.

**Where scaling gets hard:** retrieval (above), the prompt-budget ceiling as tiers multiply, and the learning store's signal-to-noise as findings accumulate. All three are knowledge-plane problems — which is the tell that **the knowledge plane, not the artifact stack, is where the hard architecture lives.**

---

## III. The vision, validated — and the missing layer

The proposed stack is **coherent**. Two amendments:

1. **It's missing an explicit cross-cutting layer: Product Patterns.** Tokens→…→Flows is the *artifact* axis, but "dashboards lead with KPIs," "destructive actions confirm," "list = filter+table+detail" aren't artifacts — they're **decisions that constrain every tier**. They already exist informally (`chooseOver`, `avoid`, failure modes). Make them a first-class, named knowledge type, or they stay scattered.

2. **The supporting axis is right but mis-ordered in most people's heads.** It's not Knowledge→Eval→Learning as a pipeline; it's a **loop with a gate**: Knowledge → (agent exercises it) → Evaluation → *verified* Learning → Knowledge. The gate (verification on held-out tasks) is the part that makes it safe. Draw it as a cycle, not an arrow.

Nothing else is missing at the vision level. The risk isn't a missing layer — it's **building the upper artifact tiers before the knowledge plane can carry them** (§XI).

---

## IV. The artifact tiers

For each: purpose · responsibility/boundary · what knowledge belongs here · what agents should learn · what must never belong here.

### Tokens
- **Purpose:** the atomic, brand-level visual decisions everything inherits.
- **Boundary:** values + their *semantic intent* ("`background-card`," not `#hex`). Nothing structural or behavioral.
- **Knowledge here:** which token expresses which decision, and *when* to reach for each (the decision, not the value).
- **Agents learn:** never hardcode raw colors/spacing; choose by semantic intent.
- **Never here:** component logic, layout, anything product-specific.

### Components
- **Purpose:** the generic, domain-free vocabulary.
- **Boundary:** reusable across any product; no data contract; "could ship in a vendor-neutral kit." The moment it gains a data contract or domain meaning, it's a widget.
- **Required metadata (the unified `ComponentManifest`):** generated (props, variants, deep-path import, `composedOf`-of-primitives) + authored (intent, when, `chooseOver`, `avoid`, `states`, `requiredProviders`).
- **Knowledge here:** selection ("which component"), wiring ("required providers"), prop contracts, failure modes.
- **Evaluation:** selection + imports + provider-wiring + failure-mode + compile/render. (We have this.)
- **Never here:** domain assumptions, data fetching, product layout.

### Widgets
- **Purpose:** the configurable, domain-meaningful, schema-first building blocks the builder instantiates — the missing middle.
- **Schema/contracts/config:** the consumption-validated widget manifest (TIER-ARCHITECTURE §3) — `dataContract`, `configSchema`, `slots`, `states`, `allowedPlacement`, `composedOf`.
- **Evaluation:** widget-selection (right widget for the need), data-contract satisfied, config-valid, placement-valid, render.
- **Examples:** Metric Card, Worker Grid, Create-Project Wizard.
- **Never here:** page-level layout/data-flow (that's a template), or being so generic it's really a component.

### Templates
- **Purpose:** a page — widgets arranged in regions with data flow.
- **Layouts/regions/data flow:** layout (`app-shell`/`bare`) + regions (intent + cardinality) + `requiredWidgets`/`optionalWidgets` + `dataSources` + `dataFlow` + responsive (TIER-ARCHITECTURE §4).
- **Evaluation:** template-selection, region-composition (cardinality + allowed widgets), data-flow validity, structure (ordering), states, behavioral.
- **Never here:** cross-page state/navigation (that's a flow), or hard-coded data (use `dataSources`).

### Flows (proposed name for "Experiences")
- **Should it exist? Yes — but last, and scoped tightly.** Templates are single-page and stateless across navigation. A flow is a **declarative sequence of templates with transitions and shared state** (onboarding, end-to-end "create project" across screens, an incident investigation). Templates alone can't express the *sequence*, the *guard conditions*, or the *state carried between pages* — that's real, encodable knowledge.
- **What it represents:** a `FlowManifest` = ordered steps (each a template ref) + transitions (+ guards) + shared state contract + entry/exit. Knowledge: "which flow for this journey, what state it carries, what the steps are."
- **The hard boundary [DECISION]:** WakeCore owns the **flow manifest + knowledge**, *not* a workflow runtime/engine. The builder/app orchestrates; WakeCore describes. Cross this line and WakeCore becomes an app framework — out of scope.

---

## V. The Knowledge System

Knowledge is **one logical body with two encodings and several types**, governed by single-source-of-truth.

**Two encodings (stop maintaining both by hand):**
- **Structured** (manifests/indexes) — machine-consumable, the source of truth.
- **Narrative** (knowledge guides, today's `SKILL.md`) — human/agent-readable, ideally *generated from* the structured layer, or at minimum explicitly downstream of it.

**Knowledge types (each tagged with `tier` + `provenance` + `status`):**
| Type | Source | Per tier |
|---|---|---|
| Structural metadata (props, variants, composedOf) | **generated** from source/.d.ts | component, widget |
| Selection/intent (intent, when, chooseOver) | **authored** (judgment) | every tier |
| Composition recipes | authored → migrate to templates | template |
| **Product Patterns** (cross-cutting rules) | authored | spans all |
| Failure modes / anti-patterns | authored + **mined** from exercise | every tier |
| Decision records (why a thing is the way it is) | authored | spans all — *new, see below* |
| Distilled learnings | **mined + verified** from exercise | every tier |

**Decision records are missing and worth adding** — short, append-only "why we chose X over Y" notes (e.g. "Sheet over Dialog for side panels because…"). They're the human rationale that `chooseOver` references but never stores. Cheap, high-trust, prevents re-litigation.

**How it all connects:** every artifact has a manifest (structured); manifests carry typed knowledge fields; cross-cutting Product Patterns + failure modes + decision records sit beside them; learnings flow *into* these from the exercise loop; narrative guides are the readable projection. **The connective tissue WakeCore lacks is retrieval** — at component-only scale you inject everything; across five tiers + accumulated learnings you must *query* ("for this task, fetch the relevant knowledge"). Retrieval is the knowledge system's missing backbone (§IX, §XI).

---

## VI. The Learning Flywheel

The platform's highest-value, least-built system. The architecture is a **governed loop**, not a pipeline — because an auto-improving knowledge base's existential risk is **polluting itself with bad learnings**.

```
KNOWLEDGE → agent EXERCISES it → EVALUATION grades it → EVIDENCE (captured)
                                                              │
                                              DISTILL (candidate learning)
                                                              │
                                          VERIFY on HELD-OUT tasks ──► regress? ──► reject
                                                              │ improves, no regression
                                                          ACCEPT (provenance + linked eval)
                                                              │
                                                     STORE (tiered learning store)
                                                              │
                                          REUSE (next agent inherits) → harder exercises
                                                              │
                                                 DECAY / RETIRE if it stops earning its keep
```

- **Captured how:** every exercise persists code + grading + diagnostics (we built this).
- **Distilled how:** a failure → a candidate learning (new failure-mode, sharper `chooseOver`, a contract). A repeated correct choice → a confirmed rule. (The Sonner-toast bug is a textbook candidate.)
- **Verified how / accepted when:** only when adding it **raises the score on held-out tasks without regressing others**. Verification is the gate. No held-out improvement → it stays a candidate, never enters knowledge.
- **Stored how:** tiered, append-only, each entry `{tier, observation, provenance(run), verifiedBy(eval), status, lastValidated}` — knowledge with a lifecycle, like reviewed code.
- **Reused / evolved how:** retrieved into future prompts; re-validated on a cadence; **decayed/retired** when an eval shows it no longer helps (knowledge can go stale as components change).
- **Becomes organizational how:** because it's verified + provenance-tracked + shared in the repo, a learning one agent earns, every agent (and teammate) inherits — the opposite of tribal knowledge.
- **Pollution prevention (the crux):** the held-out gate + provenance + regression check + decay. **A learning is never "true because an agent said so" — only because an eval it didn't author confirmed it.** This is the same teach-the-test discipline as the eval tier, applied to knowledge writes.

This flywheel is *the* WakeCore differentiator. Everything else is table stakes; a design system that **measurably improves its own knowledge from use** is not.

---

## VII. The Evaluation Platform (treat as its own product)

- **What to evaluate:** for each tier, "did the agent pick the right artifact, configure/compose it validly, and does it actually work?" — selection, contract/config validity, composition, and behavior (compile/render/a11y).
- **At which tier:** the same grader *families* recur per tier (selection, validity, behavioral); only the specifics differ. Build graders as a **tier-parameterized library**, not per-tier silos.
- **How scores evolve:** per-metric pass-rates with CIs; the headline is always **lift vs. a fair baseline**, never an absolute. Track over time as regression baselines.
- **Held-out tasks:** the non-negotiable. Tasks that *verify* knowledge must be authored independently of the knowledge (and of the manifests' own success-criteria). This is what makes every claim — and every accepted learning — trustworthy. Today's biggest eval gap.
- **Multi-model:** run the ladder across ≥2 models; a lift that survives a model swap is about the *knowledge*, not the model. Cheap insurance against the "it's just the model" critique.
- **Qualitative eval:** structural+behavioral graders can't judge "is this a *good* dashboard." Add an **LLM-judge dimension** (the SkillOpt/skillify cross-LLM angle) for subjective quality — kept separate and clearly labeled, never conflated with the deterministic metrics.
- **Browser eval:** promote render from SSR-floor to a real Chromium render + axe a11y (the repo already runs Playwright/Chromium for tests). This is where "correct = works" becomes true.
- **Regression testing:** store per-cell distributions; a change regresses if the CI of (new − baseline) excludes zero on the bad side. Compare against last *green*, not last run.
- **SkillOpt fit:** once held-out evals exist, the eval score *is* the objective function. SkillOpt = propose a knowledge edit → score on held-out → keep if better. WakeCore is an unusually good target because UI correctness is machine-checkable; the reward is cheap and objective. **SkillOpt is the last layer, not an early one — it presupposes a trustworthy held-out eval and a learning store.**

---

## VIII. The Builder Platform

The manifest family is sound and consumption-validated. Validation by piece:

| Piece | Verdict |
|---|---|
| Component / Widget / Template manifests | **Sound** — unify components into the same family (§II). |
| Instance manifests (`page-instance/0.1`) | **Sound, essential** — types vs instances is correct. |
| Data bindings (`{{source.path}}`) | **Sound** — resolves against `dataSources`, type-checks against `dataContract`. |
| Slots / regions / configuration / serialization | **Sound** — the consumption walkthrough exercised these. |
| Versioning | **Partial** — schemaVersion + per-manifest version exist; **instance version-drift (pin vs migrate) is an open decision.** |
| **Builder runtime** | **Out of scope for WakeCore** — ship a *reference renderer* (proves manifests are renderable, powers the eval's browser tier) but let the open-source builder be the product. |
| Agent interaction | **Designed** — highest-tier-first selection rule; needs retrieval to scale. |
| Persistence | **The builder's concern**, not WakeCore's — WakeCore defines the instance *format*, not where it's stored. |

**Still missing before it's a solid open architecture:** a reference renderer (the contract test for "is this manifest actually buildable"), the instance version-drift policy, and a conformance spec ("what must a builder support to consume WakeCore manifests"). Without a conformance spec, "open architecture" is a hope, not a guarantee.

---

## IX. Missing systems (only the ones that genuinely complete the architecture)

1. **Retrieval / knowledge index** — *the* unlock. Query relevant knowledge per task instead of injecting everything. Everything above component scale needs it. (Start simple: a tiered, queryable index — not necessarily a vector/graph DB on day one.)
2. **Learning store + distillation** — capture exists; the governed store + distill/verify loop (§VI) does not.
3. **Reference renderer** — the contract test that a manifest is buildable; also powers browser eval.
4. **Versioning & migration** — how a token/component/manifest version change propagates to instances; pin-vs-migrate policy.
5. **Provenance & freshness lifecycle** — every knowledge/learning entry: where it came from, when last verified, status. Partially present (`knowledgeLevel`); needs to be universal.
6. **Held-out task authoring discipline** — a *process* system, not code: who authors verification tasks, kept separate from knowledge authors.
7. **Conformance spec** — what a third-party builder/agent must support to consume WakeCore.

*Deliberately NOT recommended yet:* a full knowledge graph, vector search infra, an observability stack, a workflow engine. They're premature — solve retrieval simply first; graph/vectors only if simple indexing demonstrably fails.

---

## X. Dependency-ordered stages (not a timeline)

Ordered by *what must exist before the next thing can*. Each stage unlocks the next; skipping ahead builds on sand.

```
0. FOUNDATION         tokens · components · utils                         [done]
        │  (a stable, generic vocabulary to describe and build against)
1. UNIFORM KNOWLEDGE  one ComponentManifest family · collapse patterns·   [consolidation]
        │             contracts·structural into it · provenance on every entry
        │  (you cannot scale or retrieve knowledge that has three shapes)
2. RETRIEVAL          query-the-knowledge instead of inject-everything    [the unlock]
        │  (every tier above + every learning depends on not blowing the prompt budget)
3. EVALUATION (hard)  held-out corpus · multi-model · browser+a11y ·      [trust]
        │             regression baselines
        │  (you cannot learn or optimize against an eval you don't trust)
4. ARTIFACT TIERS     widgets → templates → flows, each authored ONLY     [expansion]
        │             once it has a manifest + knowledge + eval
        │  (expanding tiers before 1–3 multiplies unscalable, unverified knowledge)
5. BUILDER            reference renderer · instance model · conformance    [consumption]
        │  (needs the manifests from 4 and the renderer to prove they build)
6. LEARNING FLYWHEEL  distill · verify-on-held-out · governed store ·      [self-improvement]
        │             decay
        │  (needs trustworthy eval (3) + held-out discipline to gate writes)
7. OPTIMIZATION       SkillOpt over verified eval + learning store         [compounding]
           (needs the loop (6) and the objective function (3) to optimize against)
```

**The one sequencing change from our recent trajectory:** we were drifting toward *authoring widgets*
(stage 4). **Stop — do stages 1–3 first.** Authoring widgets now means pouring a 10× larger knowledge
volume into a system that has three manifest shapes, no retrieval, and an under-powered eval. Widgets
authored against that will have to be re-authored. **Consolidate knowledge, build retrieval, harden the
eval — then expand tiers.**

---

## XI. Changed assumptions / what to stop doing

Stated explicitly, because the goal is the strongest architecture, not preserving prior work:

1. **WakeCore is not "a design system with evals."** It's a knowledge+learning platform whose foundation happens to be a design system. Lead with that everywhere.
2. **Components should not be a bespoke knowledge format.** Unify them into the same manifest family as widgets. (`library-index.json` becomes a *generated projection* of per-component manifests, not the hand-authored source.)
3. **Stop hand-maintaining two encodings of the same knowledge.** Structured is the source; narrative is generated/downstream.
4. **Do not expand artifact tiers before knowledge is uniform + retrievable.** (The big one — §X.)
5. **render-smoke: commit to a real browser or remove it.** No half-graders.
6. **WakeCore must not own the builder runtime.** Ship manifests + a reference renderer + a conformance spec; the builder is a consumer.
7. **Every accepted learning must pass a held-out gate.** No learning enters knowledge because an agent asserted it — only because an eval it didn't author confirmed it.
8. **Retire overloaded words:** Experiences→Flows; patterns[]→Templates + Product Patterns; "skills"→knowledge guides (internally).

---

## What WakeCore is becoming

> A **substrate and knowledge platform for agent-built UI**: a stack of instantiable artifacts
> (tokens → components → widgets → templates → flows) wrapped in a knowledge plane that *measures*
> whether agents use them correctly and *improves itself* from that measurement.
>
> The design system is the **floor**, not the product. The product is the **flywheel** — knowledge
> that gets provably better every time an agent exercises it — and the **open manifest contract** that
> lets builders, agents, and optimization frameworks grow on top of WakeCore without WakeCore having to
> anticipate them.

If WakeCore nails one thing, it should be the flywheel with its held-out gate. A library of components
is a commodity. A design system whose knowledge **measurably compounds** — and can prove it — is not,
and it's the only part of this architecture that gets *more* valuable, not less, as AI gets better.
