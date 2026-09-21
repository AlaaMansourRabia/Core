# End-to-end flywheel slice — the WakeCore tracer bullet

> **Design of the smallest vertical slice that exercises every major subsystem exactly once** —
> knowledge retrieval → manifests → builder consumption → page instantiation → evaluation → learning
> capture → knowledge reuse — and **closes the loop**. The goal is *not* completeness. It is to prove
> the whole flywheel turns end to end, so we know the seams connect before building any subsystem
> properly. This is a design; §7 is the execution plan (one small build + one gated paid step).

## The choice that makes the slice smallest

**One task · one widget · one template region · one failure · one learning · one re-run.**

- **Task (the exercise):** *"Show three key org metrics across the top of a dashboard page."*
- **Widget:** `metric-card` (composed of real components: Card + Typography + Badge).
- **Template region:** `org-overview.kpis`.
- **The designed failure:** an agent *without* the learning assembles **three raw `<Card>`s** instead
  of reusing the `metric-card` widget — a *tier-selection* failure (it didn't reuse the widget tier).
- **The learning:** *"For KPI tiles, select the `metric-card` widget; don't assemble raw Cards."*
- **The proof:** after the learning is captured and reused, a re-run on **held-out phrasing** picks
  `metric-card` and scores higher. That single delta proves the flywheel turned.

This task is chosen because the failure *is the reason widgets exist* (reuse), so proving the loop
also proves the tier model's core value — two birds, one slice.

## Every subsystem, exactly once

| # | Subsystem | Minimal artifact | Input → Output | "It works when…" (the seam test) | Status |
|---|---|---|---|---|---|
| 1 | **Knowledge retrieval** | a filter over `widget-index` + `template-index` (NOT a vector DB) | task text → `{org-overview manifest, metric-card manifest}` | the query returns *those two*, not the whole catalog | **stub** (small fn) |
| 2 | **Manifests** | `metric-card.manifest.json` + `org-overview.manifest.json` | — | both validate against `artifact-manifest/0.1` | **exists** (illustrative, from walkthrough) |
| 3 | **Builder consumption** | the consumption rules (TIER §3–4) | template → "kpis needs metric-card ×3–6" → read widget manifest | builder resolves region→widget→config/data contract | **stub** (rules exist, no engine) |
| 4 | **Page instantiation** | `page-instance/0.1` JSON | manifests + request → instance with 3 metric-card instances (config + `{{scope.*}}` bindings) | instance is schema-valid; bindings resolve | **stub** (agent or fn emits it) |
| 5 | **Evaluation** | tier-selection · config-valid · data-contract · render graders | instance → pass/fail per metric | graders run on the *instance*; render mounts it | **mostly exists** (validators + showcase render); tier/contract graders thin-new |
| 6 | **Learning capture** | `runs/<slice>/findings.json` | the failing run → captured candidate learning | the raw-Cards failure is logged with its grading | **exists** (capture infra) |
| 7 | **Knowledge reuse** | one entry in a `learnings/` store | candidate → verified → retrieved into the *next* run | re-run retrieves the learning and the result changes | **stub** (store + distill) |

Seven subsystems, each touched once. Nothing is built "completely" — each is the thinnest stub that
lets the signal pass through to the next.

## The closed loop (the actual proof)

```
RETRIEVE (task → metric-card + org-overview manifests)
  → BUILDER reads template region kpis needs metric-card
    → INSTANTIATE page-instance (agent emits it)              ── Arm A: WITHOUT the learning
      → EVALUATE  → tier-selection FAILS (agent used raw Cards)
        → CAPTURE the failure as a candidate learning
          → DISTILL + VERIFY → accept "KPI tiles → metric-card widget"
            → STORE in learnings/
              → RE-RETRIEVE (now includes the learning)       ── Arm B: WITH the learning
                → RE-INSTANTIATE → EVALUATE → tier-selection PASSES
```

**Pre-registered success criterion (one number):** on **held-out phrasing** of the KPI task,
`tier-selection` pass-rate is **higher in Arm B (with the learning) than Arm A (without)**. If yes,
the flywheel demonstrably turns. If no, we've learned — cheaply — that the loop has a broken seam,
and exactly which one (the per-subsystem seam tests above localize the break).

## Concrete artifacts the slice needs (illustrative)

**Eval task** (`slice/kpi-row.json`):
```json
{ "id": "kpi-row", "tier": "template-region",
  "prompt": "Show three key organization metrics across the top of a dashboard page.",
  "expected": { "template": "org-overview", "region": "kpis", "widget": "metric-card", "min": 3 },
  "forbidden": ["three raw Card components in kpis"],
  "successCriteria": ["tier-selection", "config-valid", "data-contract", "render"] }
```

**The learning entry** (`learnings/widgets/kpi-use-metric-card.json`):
```json
{ "id": "kpi-use-metric-card", "tier": "widget", "status": "candidate",
  "observation": "For a row of KPI tiles, select the metric-card widget; do not assemble raw Card components.",
  "provenance": { "fromRun": "runs/slice-armA/...", "failureMetric": "tier-selection" },
  "verifiedBy": { "task": "kpi-row (held-out phrasing)", "result": "pending" } }
```

(The page-instance fragment + manifests are the ones from `BUILDER-CONSUMPTION-WALKTHROUGH.md` — reused
verbatim, not re-designed.)

## What the slice deliberately does NOT do (completeness sacrificed on purpose)

One widget (no widget library), one template region (no full page), retrieval = a filter (no index/
graph/vectors), a **one-widget reference renderer** (no general builder runtime), no generator (`library-index`
untouched), one model, k small, one learning. Each is a real subsystem reduced to its thinnest
honest form. The dependency-ordered roadmap (`WAKECORE-ARCHITECTURE.md` §X) still builds each one
*properly* afterward — the tracer just proves the path exists first.

## 7. Execution plan (what running this slice costs)

Ordered; most of it reuses what exists.

1. **Finalize the two manifests** (metric-card, org-overview) from illustrative → concrete. *(design, 0 cost)*
2. **Retrieval stub** — a ~30-line filter: task keywords + tier → relevant manifests. *(build, 0 cost)*
3. **One-widget reference renderer** — the only real build: a small `MetricCard` impl (Card+Typography+Badge)
   + an `instance→React` mapper for *this one widget*, so the eval can render the instance. *(build, ~hours)*
4. **Tier-selection + data-contract + config-valid graders** — thin additions beside existing validators;
   render reuses the showcase path. *(build, small)*
5. **Run Arm A** (no learning) — agent emits an instance; grade; capture the failure. *(1 paid step)*
6. **Distill + store + re-retrieve + Run Arm B** (with learning) on held-out phrasing; compare. *(1 paid step)*

**Cost:** the only spend is steps 5–6 — ~2 arms × small k ≈ **$2–5** (caching on). The only real code is
the one-widget reference renderer (step 3). Everything else is stubs or reuse.

**Honest risks:**
- The reference renderer is a genuine (small) build — it's the line item to approve.
- "Learning improves the re-run" might *not* hold at k-small (noise) — run enough reps that the
  Arm A→B delta clears noise, or treat a null as a real (informative) result, not a failure to hide.
- Held-out phrasing is mandatory in step 6 — if Arm B is graded on the same prompt the learning was
  written against, we've taught the test (the exact trap the whole project guards against).

## Why this is the right next move

We've validated pieces (manifest model on Button, builder consumption, the eval harness, capture). We
have **not** proven they connect into a turning flywheel. A tracer bullet is the cheapest way to find
the broken seam *before* investing in any subsystem at full scale — and if it turns, it's the single
most convincing artifact WakeCore can show: *a real failure became verified knowledge that measurably
improved the next build, end to end.*

## Scope honored
Design only. No widgets/templates/packages/runtime built, no evals run, no `library-index.json` change.
Execution (incl. the one-widget renderer + the ~$2–5 paid step) is gated on your approval.
