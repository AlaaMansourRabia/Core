# WakeCore tier architecture — components → widgets → templates (strawman)

> **Status: design strawman, consumption-validated. Nothing implemented.** Purpose: agree the tier
> model, the schema-first manifests, and how it plugs into existing WakeCore + the eval harness,
> before writing any code. Decisions that need a human call are flagged **[DECISION]**.
>
> **Updated after the builder walkthrough** (`BUILDER-CONSUMPTION-WALKTHROUGH.md`): the four
> load-bearing gaps it found are now folded into the canonical schema below — the **page-instance
> model** (§8), the **data-binding grammar** (§9), template **`dataSources`** (§4), and widget
> **`states`** (§3). Smaller discovered gaps are noted inline and in *Open decisions*.

## 0. The shape

```
Component   →   Widget        →   Template        ←  Product Pattern (cross-cutting rules)
(primitive)     (configurable     (page = widgets       (decisions that span tiers)
                 domain unit)       in a layout)
        \___________ all consumed by AGENTS ___________/
                              ↑
         Learnings  ← distilled from Exercises (eval runs)
```

Three ideas carry the whole thing:
1. **Widgets/templates are schema-first** — declarable (JSON manifest), not just code — because the
   open-source page-builder *instantiates* them, it doesn't paste React.
2. **Manifests are *types*; a built page is a tree of *instances*.** The manifest describes what a
   widget/template *is* and how it may be configured; the builder persists a separate **page
   instance** (§8) that pins specific widgets into regions with concrete config + data bindings.
   Keeping type and instance separate is what makes pages serializable, versionable, and gradable.
3. **Every tier has the same four things:** an artifact, machine-readable knowledge, an eval that
   proves agents use it right, and a learnings store fed by exercise.

---

## 1. Definitions

- **Component** — a single, generic UI primitive/control with **no domain meaning** and no data
  contract. Generic across all WakeCap products; could live in a vendor-neutral UI kit unchanged.
  *Examples: Button, DataTable, Sheet, Input.* Lives in `@wakecap/core-ui`.

- **Widget** — a **self-contained, configurable, domain-meaningful** unit composed of one or more
  components, with a declared **data contract**, **config schema**, and **slots**. Does one job a
  product person would name; droppable onto a page by the builder; declarable, not just code.
  *Examples: Metric Card, Worker Grid, Create-Project Wizard.*

- **Template** — a **whole-page layout** composed of widgets arranged in **regions**, with declared
  **data flow** between widgets and **responsive behavior**. A recognizable product page an
  agent/user picks then populates. *Examples: Org Overview, Project Schedule.*

- **Product Pattern** — a **cross-cutting design decision/convention** that spans tiers; not an
  artifact you instantiate but a rule that informs authoring and agent selection.
  *Examples: "dashboards lead with KPIs then trends," "destructive actions confirm," "list pages =
  filter strip + table + detail."* This is the **Product Intelligence** layer.

- **Learning / Exercise Result** — a **distilled, provenance-tracked, eval-verified** unit of
  knowledge produced by running exercises (eval tasks). *Example: "Sonner `toast` requires Sonner
  `Toaster`, not the Radix one."* Has `{id, tier, observation, source(run), verifiedBy(eval),
  status: candidate|verified|retired}`. The output of the flywheel; **not "saved" until an eval
  proves it helps on held-out tasks.**

---

## 2. Boundary rules

**Still a component when:** generic, no domain meaning, no data contract, no composition of domain
units. *Test:* "Could this ship in shadcn/Radix/MUI unchanged?" → component.

**Becomes a widget when:** it encodes a domain decision *or* composes components for a named job,
*and* has a config + data contract. *Tests:* "Does it have a data contract and a name a PM would
use?" / "Would you drop this whole thing onto a page?" → widget.
*DataTable = component (generic); WorkerGrid (DataTable + worker columns + filter + data contract) =
widget.*

**Becomes a template when:** it defines a page-level **layout (regions)** and **data flow across
≥2 widgets**, representing a navigable page. *Test:* "Is this a whole page you'd navigate to?" →
template. A single widget on a blank page is a *widget placement*, not a template.

**Edge cases / [DECISION]s:**
- *Widgets containing widgets?* Allow **shallow** nesting via slots; deep nesting → it's a template.
- *App shell (sidebar + top bar)?* Treat as a **template-level layout** (`layout.type: "app-shell"`),
  not a widget. **[DECISION]** confirm.
- *Where's the component/widget line for borderline cases* (e.g. is `Chart` a component and
  `TrendChart` a widget)? **[DECISION]** — recommend: anything with a data contract = widget.

---

## 3. Widget manifest (schema-first)

```jsonc
{
  "id": "worker-grid",
  "tier": "widget",
  "name": "Worker Grid",
  "category": "data",            // data | metric | form | chart | navigation | feedback | layout
  "version": "1.0.0",
  "intent": "Browse, sort, filter, and page a large worker roster; drill into one row.",
  "when": ["A list of >50 rows users must sort/filter/page", "Roster / people / asset screens"],
  "chooseOver": [
    { "over": "DataTable (component)", "because": "WorkerGrid bundles columns + filter + paging + detail; the raw component does not" }
  ],

  "dataContract": {
    "input": {
      "rows": { "type": "array", "itemSchema": { "name": "string", "role": "string", "site": "string" }, "required": true },
      "totalCount": { "type": "number", "required": false }
    },
    "events": { "onRowSelect": { "payload": { "id": "string" } } },
    "dataSource": { "mode": "injected | fetch", "scopedBy": "scope", "fetchKey": "workers" }
    //  scopedBy names a template dataSource (§4) that bindings resolve against; see §9.
  },

  "configSchema": {              // declarable props the builder/agent sets (JSON-schema-ish)
    "columns":    { "type": "array",   "default": ["name", "role", "site"] },
    "searchable": { "type": "boolean", "default": true },
    "pageSize":   { "type": "number",  "default": 25 }
  },

  "slots": {                     // named insertion points
    "toolbar":   { "description": "actions above the grid", "accepts": ["component", "widget"] },
    "rowDetail": { "description": "panel shown when a row expands", "accepts": ["widget"] }
  },

  "composedOf": ["DataTable", "Input", "Pagination", "Button"],   // GENERATED from the impl
  "variants": [ { "id": "compact", "intent": "dense rows for ops dashboards" } ],
  "requiredProviders": [],                                          // e.g. ["TooltipProvider"]
  "allowedPlacement": ["content-region", "dialog", "sheet"],       // builder may drop here; NOT "topbar"

  "states": {                    // G4 — which non-happy states the widget DECLARES it supports.
    "loading": "skeleton rows while data resolves",                //   A template can only REQUIRE a
    "empty":   "empty-state message when rows = []",               //   loading/empty/error behavior if
    "error":   "inline error + retry when the data source fails"   //   the widget declares it here.
  },                                                               //   Omit a key = not supported.

  "commonMistakes": [
    { "wrong": "searchKey not a real column id", "why": "filtering silently no-ops", "right": "searchKey must match a column id" }
  ],
  "minimalExample": {
    "declarative": "{ \"widget\": \"worker-grid\", \"config\": { \"pageSize\": 25 }, \"data\": { \"rows\": \"$workers\" } }",
    "code": "<WorkerGrid rows={workers} pageSize={25} />"
  },

  "evaluationCriteria": [        // how an exercise grades correct use of THIS widget
    { "check": "chosen for a >50-row roster need", "metric": "selection" },
    { "check": "data contract satisfied (rows provided, shape matches)", "metric": "data-contract" },
    { "check": "config valid (searchKey matches a column)", "metric": "config-valid" },
    { "check": "renders without crash", "metric": "render" }
  ],

  "knowledgeLevel": "full",      // full | concise | generated | needs-review
  "provenance": { "authoredFields": ["intent","when","chooseOver","commonMistakes"], "generatedFields": ["composedOf"], "lastValidated": "<date>" }
}
```

Fields added beyond your list — `tier`, `version`, `chooseOver`, `dataSource.mode`, `knowledgeLevel`,
`provenance`, and `evaluationCriteria` *mapped to grader metrics* — so a manifest is **eval-ready**
and consistent with `library-index.json`'s vocabulary.

**`states` ↔ templates (G4).** `states` is a *capability declaration*: a template may only
**require** loading/empty/error behavior of a region if the widget placed there declares that state.
The grader resolves a template's `states` success-criterion against the chosen widget's `states` — a
template can't promise a loading state that its widgets can't render.

---

## 4. Template manifest

```jsonc
{
  "id": "org-overview",
  "tier": "template",
  "name": "Organization Overview",
  "version": "1.0.0",
  "pageIntent": "At-a-glance health of the whole org: KPIs, trends, and recent activity.",
  "when": ["Landing page for an org-level role", "Exec / manager dashboards"],

  "layout": {
    "type": "app-shell",        // "app-shell" (sidebar+topbar) | "bare"
    "regions": [
      { "id": "header",   "intent": "page title + global filters", "span": "full" },
      { "id": "kpis",     "intent": "row of metric widgets",       "span": "full" },
      { "id": "trends",   "intent": "two-column chart widgets" },
      { "id": "activity", "intent": "recent activity feed" }
    ]
  },

  "requiredWidgets": [
    { "region": "kpis",   "widget": "metric-card", "min": 3, "max": 6 },   // cardinality lives HERE only (G2)
    { "region": "trends", "widget": "trend-chart", "min": 1 }
  ],
  "optionalWidgets": [ { "region": "activity", "widget": "activity-feed" } ],

  "dataSources": {               // G3 — REQUIRED whenever dataFlow is present. Every dataFlow.as
    "scope": {                   //   must reference a source declared here, or the manifest is invalid.
      "intent": "current org + selected date range",
      "shape": { "orgId": "string", "from": "date", "to": "date" }
    }
  },
  "dataFlow": [
    { "from": "header.filters", "to": ["kpis.*", "trends.*"], "as": "scope" }   // "scope" ∈ dataSources ✓
  ],
  "responsive": { "kpis": "4-col → 2-col → 1-col", "trends": "2-col → 1-col stacked" },

  "successCriteria": [
    { "check": "KPIs appear above trends (DOM order)",                 "metric": "structure" },
    { "check": "a loading state is present",                           "metric": "states" },
    { "check": "every required region filled with an allowed widget",  "metric": "composition" },
    { "check": "page compiles + renders",                             "metric": "behavioral" }
  ],

  "requiredProviders": ["SidebarProvider"],
  "knowledgeLevel": "full",
  "provenance": { "lastValidated": "<date>" }
}
```

**`dataSources` is required whenever `dataFlow` is present (G3).** Every `dataFlow.as` must name a
source declared in `dataSources`; a `dataFlow` referencing an undeclared source is an invalid
manifest. Region/widget cardinality lives **only** on `requiredWidgets` (G2) — `regions` describe
layout, not counts.

---

## 5. Integration with existing WakeCore

| Existing | Change |
|---|---|
| `library-index.json` | Stays the **component** catalog. Add sibling indexes `widget-index.json` + `template-index.json` ([DECISION]: separate files, not one mega-file, to keep one source of truth per tier). Component `chooseOver` can now point *up* a tier ("for a roster, prefer the WorkerGrid widget"). |
| `patterns[]` | Today's 9 recipes are **proto-templates** — migrate them into `template-index.json` as real template manifests. `patterns[]` becomes back-compat/seed, then deprecates. |
| `SKILL.md` | Add `core-ui-widgets` + `core-ui-templates` skills (narrative over the manifests: tier selection, schema-first model, the boundary rules). Existing domain skills stay. |
| `domain_map.yaml` | Failure modes gain a **`tier`** field; add widget/template fm-* (e.g. "widget used outside `allowedPlacement`", "template region left empty", "data contract unmet"). The Sonner toast bug becomes a tiered fm. |
| **eval harness** (`eval/ablation.mjs`) | Generalize: each task gets a `tier`; arms inject the relevant tier index; add tier graders (`data-contract`, `config-valid`, `region-composition`, `data-flow`) beside the existing component ones. Behavioral graders (compile/render) apply at every tier. |
| **captured findings** (`runs/*/findings.json`) | Add `tier`; a new **distill** step turns captures into `Learning` entries in the learnings store, each linked to the eval that verifies it. |

---

## 6. Folder / package structure (proposal)

```
packages/
  components/    @wakecap/core-ui          (existing: components + library-index.json)
  widgets/       @wakecap/core-widgets      NEW — widget React impls + per-widget manifests
    src/worker-grid/worker-grid.tsx
    src/worker-grid/worker-grid.manifest.json
  templates/     @wakecap/core-templates    NEW — template impls + manifests
    src/org-overview/org-overview.manifest.json
  tokens/, utils/   (existing)

# Aggregated, agent-facing indexes at repo root (generated from per-artifact manifests,
# mirroring how catalog-structural.json is generated today):
library-index.json        # components  (existing)
widget-index.json         # NEW
template-index.json       # NEW
knowledge/
  product-patterns.yaml   # cross-cutting Product Patterns
  learnings/              # the shared learnings store (distilled from exercise)
    components/  widgets/  templates/        # one small file per verified learning
skills/_artifacts/domain_map.yaml            # failure modes (gains `tier`)
eval/                                         # harness, generalized per tier
```

**[DECISION]:** widgets/templates as **separate packages** (recommended — the open-source builder
consumes them independently; core-ui stays the primitive kit) vs. folders inside core-ui.

**Agent discovery:** manifests are machine-readable; `SKILL.md` is the narrative. One entry skill
tells agents: *load `library-index` (components) + `widget-index` + `template-index`; choose the
**highest tier that fits** (template → widget → component) before composing by hand.* The
"highest-tier-first" rule is what makes agents reuse widgets/templates instead of rebuilding from
primitives.

---

## 7. Pilot (what to build to prove the tier works)

**3 widgets** (different categories, all composed from existing components, all mapping to tasks we
already have captures for):
1. `metric-card` (metric) — Card + Typography + Badge; data `{label, value, delta}`.
2. `worker-grid` (data) — DataTable + Input + Pagination; the canonical "component→widget" case.
3. `create-project-wizard` (form) — Stepper + Form + Input + Button; maps to the multi-step-form task.

**1 template:**
- `org-overview` — regions `kpis` (metric-card ×N) + `trends` (trend-chart) + loading; maps to the
  dashboard-composition task.

**2 eval tasks (reuse the ablation harness, add a `tier` field):**
1. *Widget tier* — "Show six key metrics across the top of a page." Expect the **metric-card widget**
   selected + configured (not six raw Cards). Graders: `widget-selection`, `data-contract`, `render`.
2. *Template tier* — "Build an org overview landing page." Expect the **org-overview template**, its
   `kpis` region filled with metric-card, a `trends` region, and a loading state. Graders:
   `template-selection`, `region-composition`, `structure`, `render`.

**What would prove the tier works (pre-registered):**
- **Tier-selection lift:** an ablation arm with widget/template knowledge picks the **right tier**
  (widget over raw components; template over an ad-hoc page) measurably more than the arm without it
  — CI lower bound > 0, on **held-out** phrasing.
- **The manifest is sufficient to configure correctly:** `data-contract` + `config-valid` pass-rate
  high (the agent can instantiate from the schema alone).
- **It renders:** behavioral grader passes.
- **Failure → learning:** at least one captured failure distills into a verified `Learning` that, once
  added, raises the score on re-run. That single closed loop proves "shared knowledge through
  exercise" end-to-end.

If all four hold, the tier model earns its place: agents reuse higher-tier units, configure them from
schema, produce renderable pages, and the system measurably improves itself from its own exercises.

---

## 8. Page-instance model (G6)

Manifests are **types**. A built page is a separate, persisted **instance tree** — `page-instance/0.1`
— that pins concrete widgets into a template's regions with concrete config + data bindings. This is
what the builder saves, the agent emits, and the eval grades (the manifest itself is never mutated).

```jsonc
{
  "schemaVersion": "page-instance/0.1",
  "templateRef": { "id": "org-overview", "version": "1.0.0" },   // which template TYPE this instantiates
  "dataSources": {
    "scope": { "binding": "app.currentScope", "shape": { "orgId": "string", "from": "date", "to": "date" } }
  },
  "regions": {
    "kpis": [
      { "instanceId": "k1", "widget": "metric-card", "version": "1.0.0",
        "config": { "format": "currency" },
        "data": { "label": "Revenue", "value": "{{scope.revenue}}", "delta": "{{scope.revenueDelta}}" },
        "slotFills": {} },
      { "instanceId": "k2", "widget": "metric-card", "version": "1.0.0",
        "config": { "format": "number" },
        "data": { "label": "Active workers", "value": "{{scope.activeWorkers}}" } }
    ],
    "trends": [
      { "instanceId": "t1", "widget": "trend-chart", "version": "1.0.0",
        "data": { "series": "{{scope.revenueSeries}}" } }
    ]
  }
}
```

- Each instance pins `widget` + `version`; `config` omitted keys fall back to the widget's
  `defaultConfig`.
- **Instance version drift (G7) — [DECISION]:** when a template/widget manifest version moves, do
  instances **pin** (reproducible, may go stale) or **auto-migrate** (fresh, may break)? Pick a default.

## 9. Data-binding grammar (G5)

Widget `data` inputs are bound to a source with `{{<source>.<path>}}`. Resolution + validation:

1. **Resolve** — `<source>` must be a key in the page-instance `dataSources` (which in turn satisfies
   the template's declared `dataSources`, §4). `<path>` must exist in that source's `shape`.
2. **Type-check** — the resolved type must satisfy the widget's `dataContract.input` (e.g. a
   `metric-card` `value` with `config.format = "currency"` must resolve to a `number`, not a
   pre-formatted string — see its `commonMistakes`).
3. **Scope** — a widget whose `dataContract.dataSource.scopedBy` names a source receives that source's
   current value (this is how a template's `dataFlow` filter fans out to its widgets).

A binding that fails (1) or (2) is an invalid instance — graded as a `data-contract` failure, not a
runtime crash. Literal (non-bound) values are allowed; only `{{…}}` strings are treated as bindings.

---

## Open decisions (collected)

1. Component/widget boundary for borderline cases (data contract = the line?).
2. App-shell as template-layout vs. a layout widget.
3. Separate `@wakecap/core-widgets` / `core-templates` packages vs. folders in core-ui.
4. Separate per-tier index files vs. one catalog.
5. The declarative **serialization format** the open-source builder will consume — the widget/template
   manifests (§3–§4) + the page-instance model (§8) + binding grammar (§9) are the proposal;
   **consumption-validated** in `BUILDER-CONSUMPTION-WALKTHROUGH.md`. Confirm it matches the actual
   builder before authoring many.
6. **Instance version drift (G7):** pin vs. auto-migrate when a manifest version changes.

### Smaller resolved/standing notes (from the walkthrough)
- **Versioning (G1):** indexes carry `schemaVersion`; every manifest + index entry carries a
  `version`, so the builder can refuse/migrate formats it doesn't understand.
- **Cardinality (G2):** lives **only** on `requiredWidgets` — `regions` describe layout, not counts.
- **Highest-tier-first (G8):** the agent entry skill must *explicitly* instruct template → widget →
  component selection order; otherwise agents rebuild from primitives (the documented `commonMistake`).
- **No teaching the test (G9):** a manifest's `evaluationCriteria`/`successCriteria` describe how an
  artifact *should* be graded, but **held-out eval tasks must be authored separately** from the
  manifests they exercise — same teach-the-test guard we apply at the component tier.
