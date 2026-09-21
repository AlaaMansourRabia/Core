# Core eval suite — audit (V2)

> Critique of the *current* 10-task / 4-metric suite. Goal: find where it misleads, where it's
> too easy, and what to fix — ranked by impact. No enforcement changes proposed.

## Blind spots (what the suite cannot see)

- **Behavioral correctness — now partly in the loop.** The original four metrics are structural
  string/AST checks. The V3 harness now wires **compile** (`tsc`) and **render** (render-smoke) as
  first-class metrics alongside structure. The `tsc` grader was also **corrected** for a
  duplicate-react-hook-form identity bug (see EVIDENCE.md → Grader correction); with the fix,
  with-skills compiles **~60%** (single-component) / **76%** (full-knowledge contracts arm) — below
  the structural 100% but not the earlier mis-measured 50%. Render-smoke is still only a
  server-render floor (no effects/browser APIs); **a11y (axe) does not exist**.
- **18 of 27 failure modes are invisible.** Only 9 `fm-*` are statically detectable; 18 are
  runtime-only (token ordering, chat message shape, `cn()` dedup, missing CSS import…). The
  live suite exercises essentially **one** (`fm-prim-1`, an import defect now owned by the
  imports metric) plus two provider cases.
- **No multi-file / app-entry context.** Setup failure modes (missing tokens CSS, font CDN)
  can't surface from a single snippet.
- **Single model, no held-out set.** `claude-opus-4-8` only; tasks authored by catalog authors,
  so the suite may test "did the catalog say it" rather than "is it the right call."

## Metric collinearity

- **Fixed:** `imports` and `failure-mode` no longer double-count the barrel defect (single-
  ownership: imports owns import defects, provider-wiring owns providers; `fm-prim-1`/`fm-prim-2`
  removed from failure-mode detectors → `OWNED_ELSEWHERE`).
- **Demoted:** `overall` is all-or-nothing (AND of 4), so it's dominated by whichever check the
  baseline universally fails — it mechanically reads 0→100. No longer a headline.
- **Remaining (semi-circular):** `component-choice` for the *with* arms — the catalog names the
  expected component and the grader greps for that name. It measures "used the named component,"
  not "chose it for the right reason." A behavioral/structural check (does the rendered screen
  have the right *shape*) would be sounder.

## Domain coverage (weak/absent)

| Domain | Components | Tasks | Status |
| --- | --- | --- | --- |
| primitives | 21 | 3 | ok (but easy — see below) |
| composition | — | 4 | shallow (graded on one component's presence) |
| forms | 9 | 1 | thin |
| data-tables | 21 (display) | 1 | thin |
| **chat** | 12 | **0** | absent |
| **charts** | — | **0** | absent |
| **pages/templates** | 12 | **0** | absent |
| **navigation** | 13 | **0** (partial via app-sidebar) | weak |
| maps / gantt / timeline / calendar | — | 0 | absent |

The suite meaningfully exercises ~8 components in 3 categories out of 118 in 9.

## Too easy / answer leakage

- **~half the tasks collapse to the import convention.** `button-as-link`, `destructive-action`,
  `dashboard`, `template-gallery` have empty/trivial `forbidden` sets; at the fair baseline the
  agent already gets component-choice right, so after imports they test almost nothing.
- **Provider tasks in disguise.** `icon-button-hint`, `app-sidebar`, `transient-feedback` mostly
  test provider wiring, not selection.
- **Behavioral leak.** `transient-feedback` says "auto-dismisses after a few seconds" — that
  behaviorally *is* a toast, nudging the answer.
- **Grader leak.** `component-choice` checks for the expected component *name*; the with-arm
  catalog supplies that name (see collinearity above).

## Recommended improvements — ranked by impact

1. **Run the full A0–A4 ladder.** ✅ **Done at k=3** (Tier 2, 2026-06-22) — separated selection /
   composition / failure-mode value. k=5 (tighter CIs on the +13 selection signal) still optional.
2. **Wire the `tsc` grader into the A/B as a first-class metric.** ✅ **Done (V3 harness:
   structure / compile / render)** and **corrected** for the react-hook-form-dedup bug. Turned
   "named the right thing" into "compiles against real types" — with-skills ~60% / full-knowledge 76%.
3. **Add composition tasks (V3).** ✅ **Done (2 tasks: dashboard, multi-step-form)** + pilot run.
   Confirmed single-component tasks can't exercise the A3 layer. See `V3-DESIGN.md`.
4. **Add hard selection tasks where the naive pick is wrong.** Current selection is too easy;
   need cases where `chooseOver` genuinely changes the answer (Sheet vs Dialog under specific
   constraints, DataTable vs Table at scale, Sonner vs Alert vs Banner).
5. **De-leak `component-choice`.** Grade on rendered/structural shape, not component-name
   presence, so the with-arm catalog can't hand the grader its own answer.
6. **Generalize.** Add a second model and a held-out task set authored by someone who did not
   write the catalog.
