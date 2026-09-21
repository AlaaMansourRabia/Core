# WakeCore agent evals

Measures whether the WakeCore knowledge layer (semantic catalog + composition/domain
skills + failure-mode knowledge) changes what an AI agent builds — specifically, whether
it adopts WakeCore's **import/provider conventions** and **documented component choices**.

> **Scope (be honest about what this proves):** the graders are deterministic *structural*
> checks (import paths, provider presence, documented component choice). They do **not**
> yet verify the output compiles, renders, or is accessible — so a high score means
> "followed the conventions," not "built a correct, on-brand UI." The current baseline is
> also deliberately information-starved, which inflates the `imports` lift. Both are
> addressed in `eval/V2-PLAN.md` (fair baseline + behavioral graders).

## How it works

For each task in `tasks/`, the runner asks an agent to build a small UI **twice**:

- **without-skills** — the agent gets only the package name + a basic usage instruction.
- **with-skills** — the agent additionally gets the catalog, the composition + relevant
  domain skill, and the known failure modes.

The same user prompt and output contract are used in both arms, so the **only** variable
is the knowledge layer. Both outputs are scored by the deterministic graders in
`scripts/validators/` against four metrics:

| Metric           | What it checks                                                                |
| ---------------- | ----------------------------------------------------------------------------- |
| component-choice | picked the right component (`expected`/`acceptable`, not `forbidden`)         |
| imports          | deep-path imports, no barrel, valid export paths                              |
| provider-wiring  | required providers present (TooltipProvider, SidebarProvider, Form, Toaster…) |
| failure-mode     | none of the known `fm-*` antipatterns from `domain_map.yaml`                  |

The **per-metric lift** (with − without) is what we report. Each defect is owned by exactly
one metric (barrel imports → `imports`; missing providers → `provider-wiring`), so nothing
is double-counted. The `overall` (all-or-nothing) number is **not** a headline — it is
dominated by whichever single check the baseline universally fails. Read the per-metric rows.

## Running

```bash
ANTHROPIC_API_KEY=sk-... pnpm eval
```

Outputs:

- `results/latest.json` — full structured result (committed)
- `results/summary.md` — with-vs-without scorecard (committed)
- `results/runs/<timestamp>/` — raw per-task generations (gitignored; CI artifact)

Other modes:

```bash
pnpm eval --fixture                                   # offline pipeline self-test → results/fixture-selftest.* (never latest.*)
node eval/run.mjs --regrade=eval/results/runs/<stamp> # recompute latest.* from a prior live run's raw generations, no API calls
```

The fixture self-test exercises the harness only — it writes to its own `fixture-selftest.*`
files so it can never be mistaken for a live scorecard.

## Trust the graders first

The graders are unit-tested against the `wrong`/`correct` fixtures in
`skills/_artifacts/domain_map.yaml` — every wrong example must fail, every correct one
must pass. Run that trust gate with:

```bash
pnpm test:validators
```

This is P1a; the A/B above is P1b. See the plan for the full maturity ladder
(validators → evals → nightly measurement → CI gates → regression protection → shippable
`@wakecap/validate`).

## Adding a task

Drop a JSON file in `tasks/`:

```json
{
	"id": "kebab-id",
	"title": "Short title",
	"domain": "composition | primitives | forms | data-tables | charts | chat",
	"prompt": "Describe the UI need WITHOUT naming the component (keeps the A/B clean).",
	"expected": ["TheRightComponent"],
	"acceptable": ["DefensibleAlternative"],
	"forbidden": ["TheClassicWrongPick"],
	"requiredProviders": ["ProviderName"]
}
```

Keep prompts component-agnostic — naming the component in the prompt leaks the answer to
the baseline arm and collapses the lift.
