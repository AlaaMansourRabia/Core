# Core Eval V2 — plan

> Status: V1 is a throwaway baseline. This document is the working spec for V2+.
> **Optimize for evidence a skeptical senior engineer would trust — never for bigger numbers.**

## North star

Stop producing one headline number. Produce **four separately-attributed deltas**, each
tied to a knowledge layer, each with a confidence interval, graded by checks that
increasingly mean "it works."

Separate and measure independently:

1. **Core-specific implementation knowledge** — deep-path imports, `wwc:` prefix, provider wiring.
2. **Component-selection judgment** — picking the right component for a need.
3. **Screen-composition ability** — assembling components into a correct screen.
4. **Real implementation correctness** — does it compile / render / pass a11y.

## Core design change: ablation arms (not with/without)

A two-arm test cannot separate the four areas above. Replace it with a **knowledge ladder**
where each rung adds exactly one layer; the *incremental* lift between adjacent rungs
attributes value to that layer alone.

| Arm | Adds over previous | Isolates |
| --- | --- | --- |
| **A0** naive | package name only (today's baseline) | convention *discoverability* (reference only — not a headline) |
| **A1** fair baseline | README + exports map + install + public component APIs (props/variants, no semantics) | "knows the API" floor |
| **A2** + semantic catalog | `intent` / `when` / `chooseOver` / `avoid` | **(2) selection judgment** = A2 − A1 |
| **A3** + composition | composition skill + `patterns[]` | **(3) composition ability** = A3 − A2 |
| **A4** + failure modes | failure-mode exemplars + domain skills | **(1) implementation knowledge** = A4 − A3 (and A1 − A0) |
| (all arms) | — | **(4) real correctness** = behavioral graders applied across every arm |

---

## 1. Credibility fixes — DONE in this pass

| # | Problem | Fix (shipped) |
| --- | --- | --- |
| C1 | Committed scorecard was a `mode:fixture` hand-authored self-test masquerading as live evidence. | Fixture mode now writes `results/fixture-selftest.*` and can never overwrite `latest.*`. Added `--regrade=<dir>` and regenerated `latest.*` from the real run `runs/2026-06-18T11-47-48-077Z`. |
| C2 | Root `README.md` claimed the harness proves agents build "correct, on-brand UIs." | Reworded to "measures whether an agent adopts import/provider conventions and documented choices; does not yet verify compile/render." |
| C3 | `eval/README.md` claimed "proof … builds on-brand, correct UIs." | Reworded + added an explicit scope caveat. |
| C4/C5 | `imports` Rule 1 and `fm-prim-1` detected the **same** barrel defect → counted on two metrics (and a third via `overall`). Same for provider defects (`fm-prim-2/3`, `fm-form-2`). | Single-ownership: removed `fm-prim-1`/`fm-prim-2` from failure-mode detectors; added `OWNED_ELSEWHERE` set; coverage test updated + a no-double-count test added. |
| C6 | `overall` (AND of 4) was the headline → mechanically guaranteed 0→100. | Per-metric rows are now the headline; `overall` demoted to a caveat line. |

**Effect on the real numbers** (honest, de-collinearized):

| Metric | Without | With | Lift | Note |
| --- | --- | --- | --- | --- |
| component-choice | 90% | 100% | **+10** | one task (data-grid) |
| imports | 0% | 100% | **+100** | real, but confounded — baseline prompt *induces* the barrel (see §2) |
| provider-wiring | 80% | 100% | **+20** | two tasks (Toaster, SidebarProvider) |
| failure-mode | 100% | 100% | **+0** | the V1 "+60" was entirely the import defect double-counted |

**Defect-ownership map (each defect → exactly one metric):**

| Defect class | Owner | fm-* |
| --- | --- | --- |
| barrel / bad subpath | `imports` | fm-prim-1, fm-setup-1 |
| missing provider | `provider-wiring` | fm-prim-2, fm-prim-3, fm-form-2 |
| unprefixed `wwc:` | `failure-mode` | fm-prim-5 (+ aliases fm-setup-4, fm-utils-3, fm-prim-4) |
| wrong-source import | `failure-mode` | fm-form-3 |
| component misuse | `failure-mode` | fm-dt-2/3, fm-chart-1, fm-form-1 |

---

## 2. Fair baseline (A1)

The smoking gun: `baselineSystem()` says *"Components are imported from @core/core-ui"* —
which **induces** the barrel import the `imports` metric then penalizes. The V1 imports lift
is largely a prompt-wording artifact.

Build A1 from existing sources, giving the baseline **structural** info but **not semantic
judgment**:

```
A1 = OUTPUT_CONTRACT
   + README install section
   + exports subpath list        (from packages/components/package.json#exports)
   + structural API digest        (scripts/catalog-structural.json, semantics stripped)
A2..A4 = A1 + progressively: semantic digest → composition + patterns → failure modes + domain skill
```

Delete the barrel-inducing line. **Acceptance check:** under A1, `imports` should jump toward
parity. If A4 − A1 on imports stays large, the catalog genuinely teaches something the README
does not. Either way we learn the truth, and the imports lift stops being a gimme.

**Status — BUILT (offline-validated), pending the live key.** `eval/ablation.mjs` runs the
A0–A4 ladder k times/arm and aggregates with Wilson CIs (`pnpm eval:ablation`). The arm
layering is verified without spending tokens (`pnpm eval:ablation:dry` — all checks pass:
A1 exposes deep-path imports but withholds `chooseOver`; A2 adds semantics; A3 adds patterns;
A4 adds failure modes; sizes monotonic A0 321 → A1 24k → A2 69k → A3 84k → A4 92k chars).
First read needs `ANTHROPIC_API_KEY`: `ANTHROPIC_API_KEY=sk-... pnpm eval:ablation -- --k=5`.

---

## 3. Composition task set (9 tasks)

Each task: a behavioral prompt (names a *user goal*, never a component), a measurable
required-structure rubric, an explicit anti-leak note. Grading = set-membership +
relationship (ordering / nesting / prop-shape) assertions, plus the §4 behavioral graders —
never "did string X appear."

| Task | Goal frame (no component names) | Rubric (structural ∧ behavioral) | fm exercised |
| --- | --- | --- | --- |
| Dashboard assembly | "org landing: KPIs on top, trends below, loading state" | card + chart + skeleton families; KPIs above charts (DOM order); compiles; no axe-critical | — |
| App shell | "authenticated screen, collapsible left nav + content" | sidebar family ∧ its provider ∧ `<main>` sibling; renders without context throw | fm-prim-3 |
| Form-heavy workflow | "multi-section create-entity form, inline validation, required fields" | form family ∧ FormItem wraps FormControl ∧ message nodes; typed submit; compiles | fm-form-1/2/3 |
| Data-management workflow | "500 rows, sort/filter/page, row→detail" | data-grid family (not plain table) ∧ search bound to a real column id ∧ one of getSubRows/renderSubComponent; compiles | fm-dt-1/2/3 |
| Template gallery flow | "browse searchable templates in focused overlay → preview → confirm" | overlay + search + card-grid; focus-trap; renders | — |
| Multi-step journey | "3-step wizard: details → members → review, with progress" | stepper/progress family ∧ step state ∧ back/next; compiles | — |
| Navigation architecture | "top bar + breadcrumb + org/project switch + section tabs" | nav family set ∧ single nav landmark ∧ tabs switch panels; axe landmarks pass | — |
| Chat workflow | "AI assistant panel: prompt input, streamed messages, tool-call/thinking state" | chat family ∧ message prop shape matches type ∧ ChartRenderer (not raw ECharts) | fm-chat-1/2/3, fm-chart-1 |
| Analytics workflow | "filterable analytics view: filter strip drives charts + a data table" | filter + chart + table wired to shared state; valid pie keys; compiles | fm-chart-2/3, fm-tok-* |

---

## 4. Behavioral graders — "correct" means "works"

Leverage: the repo **already** runs Vitest 4 + browser mode + Playwright/Chromium — render
and axe graders reuse it, no new stack.

| Grader | Mechanism | Catches | Effort |
| --- | --- | --- | --- |
| tsc-compile | snippet → typed harness project depending on real `@core/core-ui`; `tsc --noEmit` | wrong props, bad imports, fm-dt-1, fm-form-3, fm-chat-2 (free) | M |
| import-resolution | actual module resolution against `exports` | unexported subpaths, barrel-undefined-at-runtime | S |
| provider-runtime | render in browser; assert no "must be used within Provider" throw | fm-prim-2/3, fm-form-2 as runtime facts | M |
| render-smoke | mount; assert no throw, non-empty DOM | broken composition, missing required children | M |
| axe-a11y | `axe-core` on rendered output; fail on critical/serious | labels, landmarks, contrast | M |

**Promotion rule:** a task metric is "behaviorally confirmed" only if tsc-compile ∧
render-smoke pass; structural checks become *explanations* of failures, not the verdict.

**Status — tsc-compile grader BUILT (`eval/graders/compile.mjs`), validated on the real run.**
Type-checks snippets against the *built* `@core/core-ui` types via the compiler API
(`moduleResolution: bundler`, so the `exports` map resolves as a real build does). Two signals:
`resolves` (imports + named exports valid) and `compiles` (full type-check clean).
Reproduce: `node eval/graders/run-compile.mjs eval/results/runs/2026-06-18T11-47-48-077Z`.

**First behavioral read (the structural graders were too coarse):**

| Behavioral metric | Without | With | vs. structural "with" = 100% |
| --- | --- | --- | --- |
| resolves (imports + named exports exist) | 0% | **90%** | found a hallucinated export the imports grader missed |
| compiles (full type-check) | 0% | **50%** | half the "passing" with-skills snippets don't type-check |

Concrete defects tsc caught that the structural graders passed:
- `app-sidebar.with` — imported a non-existent member from `@core/core-ui/pages/core-content-area` (structural imports grader only checked the subpath existed, not the named import).
- `icon-button-hint.with` — `size="icon"` on Button (valid sizes: `default|sm|lg`).
- `template-gallery.with` / `validated-form.with` — wrong props to SearchFilterBar / Form.
- All 10 baseline snippets fail `resolves` via *real* module resolution (the barrel has no `Button` export) — behaviorally confirming fm-prim-1.

Takeaway: the V1 "with-skills = 100%" was an artifact of coarse graders. The behavioral floor is
90% resolves / **~60% compiles** (corrected — the earlier 50% double-counted a grader
react-hook-form-dedup bug; the `Form` item above was that artifact, not a real defect; see
EVIDENCE.md → Grader correction). Full-knowledge (contracts) arm compiles ~76%.

---

## 5. Failure-mode coverage (all 27)

| Status | fm-* | Notes |
| --- | --- | --- |
| Statically detected (7) | form-3, form-1, dt-2, dt-3, chart-1, tok-1, prim-5 | keep |
| Owned by another metric (5) | prim-1, setup-1 (→imports); prim-2, prim-3, form-2 (→provider) | single-ownership, not double-counted |
| Aliases of a detected mode (2) | setup-4, utils-3, prim-4 (≈ prim-5) | documented in RUNTIME_ONLY |
| Becomes free under V3 behavioral (8) | dt-1, chat-2, tok-2, tok-3, setup-2, chart-3, chat-1, chart-2 | covered by tsc/render once §4 lands + §3 tasks exercise them |
| Needs targeted task/grader (small) | chat-3, utils-1, utils-2 | one tiny task each |
| Declared out of scope | setup-3 (fonts/air-gap = environment) | state explicitly, don't silently skip |

**Minimum task set to close the high-value gaps:** the Data-management, Chat, and Analytics
composition tasks (§3) — together they exercise ~11 of the genuinely-uncovered modes once
behavioral grading is on. **Coverage target to publish: ≥ 22 / 27.**

---

## 6. Statistical methodology

Metrics are paired binary outcomes (same task, arm A vs arm B). Treat them that way.

- **Repetition:** k = 5 / arm / task for dev dashboards; k = 10 for any published or gated claim. Fix and record `temperature`, model, seed.
- **Per-cell estimate:** pass-rate with **Wilson 95% CI** (correct near 0/1).
- **Paired comparison:** **McNemar's test** on per-sample paired outcomes for adjacent-arm lift; report lift with a **bootstrap 95% CI** over tasks×samples.
- **Per-task transparency:** never average tasks away — a +20pt mean that is one task flipping must be visible.
- **Regression detection:** store per-cell pass distribution as baseline; a run regresses if the bootstrap CI of (new − baseline) excludes 0 on the bad side. Compare against the last *green* baseline, not last night (avoids noise-chasing).

**Evidence bar before a claim is allowed:**

| Claim | Required evidence |
| --- | --- |
| improves **component selection** | A2 − A1 lift, CI lower bound > 0, k≥10, across ≥6 tasks where the naive pick is wrong, ≥2 models |
| improves **composition** | A3 − A2 lift, CI LB > 0, on §3 tasks, graded by render-smoke + structure, k≥10 |
| improves **implementation correctness** | A4 vs A1 on tsc-compile + render + axe, CI LB > 0, k≥10, ≥2 models |
| reduces **failure modes** | per-fm rate drop, CI LB > 0, on ≥22/27 covered modes |

If a CI straddles 0, report "no measurable effect at current power." Willingness to say this is *why* the result is trustworthy.

---

## 7. Roadmap

| Phase | Objective | Scope | Effort | Confidence gained |
| --- | --- | --- | --- | --- |
| **V2 — credible benchmark** | Honest, de-confounded, attributed lift (structural graders) | §1 (done); ablation arms A0–A4; §2 fair baseline; §6 multi-run + CIs | M (1–2 wks) | Kills false confidence; gives a smaller, defensible per-layer number; answers "is the lift real, and where." |
| **V3 — behavioral benchmark** | "Correct" = compiles + renders + a11y; close fm gaps | §4 graders (tsc → render → axe on existing Vitest/Chromium); §3 nine tasks; §5 to ≥22/27 | L (3–4 wks) | Validates real correctness; subsumes runtime-only fm; the 100%-with ceiling stops being suspicious because the bar is hard. |
| **V4 — regression gating** | Protect the metric over time | nightly k≥10 multi-model; variance-aware McNemar gate; CI warn→block once stable; per-PR fast subset | M | Drift protection — trustworthy *only because* V2/V3 made the metric mean something. |
| **V5 — publishable `@core/validate`** | Ship surviving graders as a consumer-CI product | extract the behavioral graders that passed V3; docs; the eval becomes its own test suite | M | Independent/external validation; the proof survives outside contact. |

**Sequencing rule:** no phase ships its claim until the prior phase's evidence bar (§6) is
met. V4 gating is forbidden until V2+V3 produce a metric whose CI you would stake a release
on — gating earlier institutionalizes the V1 confound. When the fair baseline shrinks the
lift, the smaller number ships.
