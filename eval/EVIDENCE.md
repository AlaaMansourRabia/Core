# WakeCore — evidence & validation (engineer-facing)

> Purpose: answer, honestly, how we validate that agents learn from WakeCore, what is
> proven today, and what is not. Pairs with `eval/V2-PLAN.md` (roadmap) and `eval/AUDIT.md`
> (suite critique). **No enforcement is proposed here** — measurement only.

## What We Know Now (2026-06-23)

A short, current-state summary for leadership and engineers, after a **grader correction**.

**Grader correction:** the `tsc` compile grader had a bug — in this monorepo it resolved
react-hook-form to two different paths (the test snippet vs `@wakecap/core-ui`'s types), creating
duplicate type identities and **false** `<Form {...form}>` compile errors that a real consumer app
(one react-hook-form) never hits. Fixed by deduping react-hook-form in `eval/graders/compile.mjs`.
All offline re-grades below use the corrected grader. **No paid evals were run.**

**Bottom line:** WakeCore's measurable value is **composition knowledge → fewer failure modes**
(large, proven); **component selection** improves modestly (positive, not yet statistically
conclusive); and it adds **nothing on import/provider conventions** (a fair baseline already
handles those). Generated code's real **compile** rate, once measured correctly, is **~60% (simple)
to ~76% (full knowledge)** — below the structural "100%", but materially higher than the buggy
grader first showed, and **there is no WakeCore Form/type bug**.

| Conclusion | Status |
|---|---|
| Conventions (imports/providers) are *not* WakeCore's value — fair baseline = 100% across arms | ✅ **still valid** |
| Composition skill is the largest measurable contributor (failure-mode 23%→97%, +73, CI-separated) | ✅ **still valid** |
| Component selection improves (+13) but not yet conclusive (needs k≥10, harder tasks) | ✅ **still valid** |
| Structure (100%) overstates real correctness | ✅ **still valid, but smaller gap** (compile 60–76%, not 50%) |
| "with-skills compiles ~50%" | 🟡 **changed → ~60%** (single-component) / **76%** (full-knowledge contracts arm) |
| "Form / react-hook-form is the #1 compile blocker (~6/21), a WakeCore typing/packaging bug" | ❌ **disproven** — a grader artifact; Form is fine for real consumers |
| The one-line `typeof FormProvider` source fix | ❌ **disproven / reverted** — the dts bundler expands it; no-op |
| V3 pilot compile figures (0–17%, uncommitted) for form-bearing tasks | ⚠️ **superseded** — measured pre-correction; unreliable for forms |

## 1. How are we validating that agents are learning?

A/B **ablation**: the same task and the same output contract are sent to the model twice (or
across a ladder of arms); the **only** variable is how much of the knowledge layer is in the
system prompt. Outputs are scored by deterministic graders, and the **lift** between arms is
the learning signal.

Two design choices make the signal trustworthy:
- **Fair baseline (A1).** The control is *not* information-starved. A1 gets the README, the
  package `exports` map, and the structural component API (names, deep-path imports,
  variants) — exactly what a developer reading the package sees. So we measure the value of
  *WakeCore's judgment*, not of a withheld convention. (The old A0 baseline was told to use
  the barrel, which manufactured a fake +100 imports lift — see `AUDIT.md`.)
- **Statistics.** k repetitions per arm, pass-rates reported with **Wilson 95% CIs**. A claim
  is only allowed when the lift's CI lower bound clears 0.

Ablation ladder (each rung adds exactly one layer):

| Arm | adds | isolates |
| --- | --- | --- |
| A0 | nothing (naive, reference only) | — |
| A1 | structural package facts (fair control) | "knows the API" floor |
| A2 | semantic catalog (`intent`/`when`/`chooseOver`/`avoid`) | **selection** = A2−A1 |
| A3 | composition skill + `patterns[]` | **composition** = A3−A2 |
| A4 | failure-mode exemplars + domain skill | **failure-mode avoidance** = A4−A3 |

## 2. Where is the knowledge stored?

Four files, one source of truth each, shipped *with the package*:

| Layer | File | Holds |
| --- | --- | --- |
| Component semantics | `library-index.json` | per-component `intent`/`when`/`chooseOver`/`requires`/`avoid`/`knowledgeLevel` |
| Composition recipes | `library-index.json › patterns[]` | screen-level assembly |
| Narrative guidance | `packages/components/skills/**/SKILL.md` | selection + composition guides |
| Failure modes | `skills/_artifacts/domain_map.yaml` | 27 `fm-*` wrong/correct exemplars |

It is data, not weights: versioned, diffable, reviewable.

## 3. How is that knowledge reused by other agents?

At **prompt time**, not via fine-tuning. Any agent, in any session, on any machine, gets the
same knowledge by reading these files (loaded via `@tanstack/intent` after install). Add one
`fm-*` entry or one `chooseOver` and **every** agent everywhere inherits it on next load. No
per-agent memory, no retraining, no drift between teammates.

## 4. What evidence is proven today?

- **The graders are trustworthy.** P1a trust gate is green (23/23): every `wrong`/`correct`
  fixture in `domain_map.yaml` flags/passes as expected. We proved the ruler before measuring.
- **The committed claims are now accurate.** Fixture self-test is quarantined; the real run is
  regraded with single-ownership metrics (no double-counting); READMEs scoped to "structural
  checks, not compile/render."
- **The imports lift was an artifact (disconfirmed, n=30).** Tier 2 ladder (A1–A4, k=3, 10
  tasks, 2026-06-22): `imports` and `provider-wiring` sit at **100% across all four arms**. The
  fair baseline (A1) already nails them from the public package metadata — WakeCore's
  semantic/composition/failure layers add **zero** on conventions. The V1 "+100 imports lift"
  is confirmed a rigged-baseline artifact. (Full scorecard: `eval/results/ablation.md`.)
- **Composition knowledge is the largest measurable contributor (proven).** The **A2→A3** step
  (composition skill + patterns) lifts failure-mode avoidance **23% → 97% (+73 pts)** with
  fully separated CIs ([12–41] vs [83–99], p≪0.001). Notably the lift lands on the composition
  *skill*, not the explicit failure-mode digest (A3→A4 is +3 = ceiling noise) — the prose skill
  already teaches the rules the detectors check (`wwc:` prefix, Form composition, deep imports).
- **Component selection: positive but not yet conclusive.** A1→A2 (semantic catalog) moves
  component-choice **83% → 97% (+13 pts)**, right direction but CIs overlap (Fisher p≈0.19 at
  n=30). A1 is already 83% because the current tasks are single-component and easy — needs
  **k≥10 and harder selection tasks** to settle.
- **Behavioral correctness is lower than the structural 100% — but higher than first measured.**
  The `tsc` grader (`eval/graders/compile.mjs`) type-checks against the *real built* types. After
  correcting a grader bug (duplicate react-hook-form identity — see the Grader-correction note
  at the top), with-skills single-component output is **90% resolves / 60% compiles** (the earlier
  "50%" was the artifact), and the contracts pilot's full-knowledge arm compiles **76%**. Structure
  still overstates real correctness, but the gap is narrower than the pre-correction numbers
  implied. `tsc` is now a first-class metric in the V3 harness (structure / compile / render).

## 5. What evidence is still missing?

- **Statistical power on selection.** The layers are now *separated* (Tier 2, k=3) — the gap is
  power: selection (+13) needs **k≥10 and harder selection tasks** (where the naive pick is
  wrong) before its CI clears 0. The composition lift (+73) is already conclusive.
- **Behavioral fidelity beyond compile.** `tsc` (corrected for the RHF-dedup artifact) and a
  render-smoke grader are now wired into the V3 harness, but render-smoke is only a *server-render
  floor* (no effects/browser APIs) and a11y (axe) doesn't exist — so "does it actually run in a
  browser" is still unproven.
- **Composition-level tasks.** Current tasks are single-component, so the proven +73 is
  *failure-mode avoidance*, **not** screen-assembly quality. Whether composition knowledge helps
  the agent build a correct dashboard/app-shell is untested (see `V3-DESIGN.md`).
- **Attribution entanglement.** The +73 lands on the composition skill, but the composition
  skill and failure-mode digest overlap in content — these tasks can't tell whether the
  failure-mode exemplars would matter for failure modes the skill doesn't cover.
- **Generalization.** Single model (`claude-opus-4-8`), single k=3 run; no multi-model; tasks
  authored by the catalog authors (no held-out set).

**Honest one-liner:** the layers are separated (Tier 2, n=30): WakeCore's value is **composition
knowledge → fewer failure modes (+73, proven)**, a **smaller, not-yet-significant selection bump
(+13)**, and **zero on import/provider conventions** (the fair baseline already handles them).
Behavioral compile is now measured (≈60% single-component / 76% full-knowledge, after the grader
correction); browser-render quality and screen-composition quality remain unproven.

## 6. What would a future enforcement + enablement model look like?

(Design only — explicitly NOT being built now.)

Enablement stays primary: the catalog/skills in the prompt raise the floor *before* the agent
writes. Enforcement is added **per-defect, only after proof**, via the validators-as-graders
that already exist:

```
knowledge (enablement)
  → validator proven correct (P1a ✓)
    → that metric's lift CI clears 0 in the full ladder
      → behavioral grader (tsc/render) confirms it's real, not string-deep
        → promote THAT check to a warn-only CI signal
          → only then, a gate
```

Principles: (1) prove before enforce; (2) promote individual checks, never a blanket gate;
(3) enforcement is a floor for *proven* defects, not a syntax cage (not Orbit-style); (4)
`@wakecap/validate` extraction is deferred until a behavioral grader has survived the full
ladder. None of this proceeds until §5's missing evidence exists.
