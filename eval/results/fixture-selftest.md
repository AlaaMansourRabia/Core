# Core agent eval — with vs without the knowledge layer

> ⚠️ **Fixture self-test** — graded against stored snippets in `eval/fixtures/`, NOT a live agent. Numbers here exercise the pipeline only; they are NOT evidence about agent behavior. Run `pnpm eval` with an API key for real numbers.

Run: fixture · mode: fixture · model: claude-opus-4-8 · tasks: 10

Pass-rate per metric. **With-skills** = catalog + composition/domain skills + failure-mode knowledge in the system prompt; **without** = package name + basic usage only.

| Metric | Without skills | With skills | Lift |
| --- | --- | --- | --- |
| component-choice | 60% | 100% | +40 pts |
| imports | 60% | 100% | +40 pts |
| provider-wiring | 70% | 100% | +30 pts |
| failure-mode | 70% | 100% | +30 pts |

**Caveat metrics (not headline):** `overall` (every metric must pass) — 0% → 100%. `overall` is all-or-nothing, so it is dominated by whichever single check the baseline universally fails; read the per-metric rows instead.

> Graders are the deterministic validators from `scripts/validators/` (proven in P1a). Each defect is owned by exactly one metric (no double-counting). These checks are structural (import paths, provider presence, documented component choice) — they do **not** yet verify the output compiles or renders. See `eval/V2-PLAN.md`.
