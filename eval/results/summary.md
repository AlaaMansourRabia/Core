# WakeCore agent eval — with vs without the knowledge layer

> ℹ️ **Regrade** — recomputed from the raw generations in `eval/results/runs/2026-06-18T11-47-48-077Z` with the current graders (no new model calls). Provenance: a live claude-opus-4-8 run.

Run: regrade-of-2026-06-18T11-47-48-077Z · mode: regrade · model: claude-opus-4-8 · tasks: 10

Pass-rate per metric. **With-skills** = catalog + composition/domain skills + failure-mode knowledge in the system prompt; **without** = package name + basic usage only.

| Metric | Without skills | With skills | Lift |
| --- | --- | --- | --- |
| component-choice | 90% | 100% | +10 pts |
| imports | 0% | 100% | +100 pts |
| provider-wiring | 80% | 100% | +20 pts |
| failure-mode | 100% | 100% | +0 pts |

**Caveat metrics (not headline):** `overall` (every metric must pass) — 0% → 100%. `overall` is all-or-nothing, so it is dominated by whichever single check the baseline universally fails; read the per-metric rows instead.

> Graders are the deterministic validators from `scripts/validators/` (proven in P1a). Each defect is owned by exactly one metric (no double-counting). These checks are structural (import paths, provider presence, documented component choice) — they do **not** yet verify the output compiles or renders. See `eval/V2-PLAN.md`.
