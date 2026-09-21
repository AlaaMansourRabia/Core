# WakeCore compliance migration

WakeCore compliance now describes the strength of the validated claim instead of treating any
WakeCore import as full adoption. The migration preserves the legacy mode while clients move to
goal-specific, multi-file validation.

## Mode mapping

| Previous request                                                         | New mode                   | Intended claim                                                                     |
| ------------------------------------------------------------------------ | -------------------------- | ---------------------------------------------------------------------------------- |
| `wakecore-only`                                                          | `wakecore-imports`         | WakeCore imports/component usage are present.                                      |
| Product UI checked with `wakecore-only`                                  | `wakecore-product`         | A product interface meaningfully adopts the planned WakeCore artifacts and tokens. |
| Showcase/evaluation checked with `wakecore-only`                         | `wakecore-showcase`        | The implementation visibly demonstrates meaningful WakeCore breadth.               |
| Direct-template reproduction checked with `wakecore-only` and `template` | `wakecore-template-strict` | The selected template and its required structure are preserved.                    |

`wakecore-only` is a deprecated alias for `wakecore-imports`. A successful legacy response must be
reported as import-level compliance only. It cannot be promoted to product, showcase, or strict-template
compliance.

## Request migration

New clients should choose an implementation goal during planning and use its matching validation mode:

- `product-ui` → `wakecore-product`
- `wakecore-showcase` → `wakecore-showcase`
- `component-evaluation` → `wakecore-showcase` (the plan narrows coverage to the evaluated components)
- `visual-reproduction` → `wakecore-template-strict`

Send the complete final implementation in `files`: application-authored TS/TSX files, relevant
CSS/style files, route definitions, and the entry point. Use the single-string `code` input only with an older deployed
server that does not accept `files`. Carry forward `implementationPlan`, including the returned
`planId`/`contractVersion` when present, goal, implementation mode, template context, application/artifact
contract, route/region map, and substitutions supported by the installed schema:

1. An artifact utilization map covering every required and recommended artifact.
2. A final WakeCore inventory distinguishing imported, rendered, and visibly exercised artifacts.
3. For `adapt-template`, structured substitutions with route, region, attempted fallback artifacts,
   requested capability, replacement, rationale, and catalog-gap identity when no catalog artifact applies.
4. The selected/reference template when required by the chosen mode.
5. For contract v2 product/showcase plans, `runtimeAudit` evidence bound to the same `planId` and covering
   every route, the normative shell fingerprint, persistent shell DOM identity outside explicit module
   boundaries, owned computed visuals, history behavior, console/accessibility errors, and required interactions.
6. Exact token existence, semantic-role and value-type evidence across CSS and TS/TSX, plus CSS ownership
   evidence that rejects internal slot/state/role selectors and hybrid component variants.

The plan's workspace requirements include the runtime-audit producer, Playwright dependency, package
script, command, and required data attributes. Clients must install and verify that command during setup;
they cannot claim completion when the harness is absent or unrunnable.

## Screenshot-first migration

Visual-reproduction clients must create `referenceAnalysis` before calling `resolve_template` and carry it
unchanged into `create_implementation_plan` and `validate`. The analysis records the reference shell,
navigation model, density, region hierarchy, scroll ownership, responsive implications, implied interactions,
semantic relationships, and source-brand traits to replace. Every analyzed region must map to a named
WakeCore owner or explicit catalog gap.

Screenshot plans use runtime audit v4. Evidence must show a `100dvh` viewport-owned shell with hidden
document overflow, route-owned content scrolling, stationary sidebar geometry, contiguous shell boundaries,
artifact-owned DataTable/chart/tab visuals, no duplicate dividers or affordances, desktop and 820px responsive checks with no horizontal overflow/group overlap or split, accessible icon actions, supported navigation relationships,
and observable state changes for required canvas capabilities. Completion reports two independent results:
reference fidelity for the preserved information architecture and intent, and WakeCore fidelity for artifact,
token, shell, accessibility, and interaction ownership.

Clients must not fabricate fields that an older server does not expose. During a mixed-version rollout,
report missing evidence or detailed output as a migration limitation and keep the compliance claim at the
level the server actually verified.

## Response migration

Completion reporting should include the selected goal and mode, `compliant`, the compliance level,
per-category scores, tier and component coverage, recursive token provenance, CSS ownership, route/static
adoption, runtime coverage, blocking findings, advisory findings, and the final artifact inventory. Treat
`compliant=true` as scoped to the requested mode. For example,
`wakecore-imports` success does not imply `wakecore-product` success.

If a response omits a new detail because the deployed server predates that field, preserve the response
as a legacy import-level result rather than filling the gap with a client-side assumption.

## Staged rollout

### Stage 1: compatibility and observation

- Accept `wakecore-only` as an alias for `wakecore-imports` and emit a deprecation notice.
- Introduce implementation goals, artifact contracts, and goal-specific modes.
- Collect goal-specific findings in advisory/shadow form where enforcement is not yet calibrated.
- Update clients to report the requested mode and avoid stronger claims from legacy results.

### Stage 2: multi-file evidence

- Move clients from a single `code` fragment to the supported TS/TSX, CSS, and entry-point file set.
- Send the plan/contract evidence, artifact utilization map, inventory, and adaptation substitutions.
- Display category scores, artifact coverage, and blocking/advisory findings separately.
- Keep legacy requests operational, but label them import-level compliance.

### Stage 3: goal-specific enforcement

- Make stable product, showcase, and template rules blocking for their corresponding modes.
- Keep calibrated exceptions and uncertain heuristics advisory until their false-positive rate is known.
- Reject completion claims when the selected mode has blocking findings even if import checks pass.
- Require route-complete runtime evidence for contract v2 product/showcase plans; keep v1 requests compatible.

### Stage 4: legacy retirement

- Measure remaining `wakecore-only` traffic and publish a removal window before disabling the alias.
- Migrate stored examples, prompts, and integrations to `wakecore-imports` or a stronger goal-specific mode.
- Remove the alias only after supported clients no longer depend on it.

The rollout order separates honest reporting from stricter enforcement: clients can stop overstating
compliance before every structural and rendered-visibility rule becomes blocking.
