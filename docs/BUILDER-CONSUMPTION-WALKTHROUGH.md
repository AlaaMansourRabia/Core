# Builder consumption walkthrough — validating the manifest schema (decision #5)

> **Design/prototype document. No runtime code, no packages.** One complete end-to-end example —
> `org-overview` template + `metric-card` widget — traced through a page-builder so we can judge
> whether the manifest format from `TIER-ARCHITECTURE.md` is *sufficient* for an open-source builder
> (and an agent) to consume. Every artifact below is illustrative JSON, not shipped.
>
> **Headline result:** the schema mostly holds, but the walkthrough surfaced **9 gaps** (see §10) —
> most importantly that the builder needs an explicit **instance model** (manifests are *types*; the
> page is a tree of *instances*), a **data-binding/source resolution** spec, and **slot/region fill
> rules**. Fix these before authoring real widgets.

---

## 1. Builder discovers what's available

The builder loads two generated indexes (thin — id/name/category/intent/tier only; it lazy-loads the
full manifest on selection).

### `widget-index.json` (illustrative)
```json
{
  "version": "0.1.0",
  "tier": "widget",
  "widgets": [
    { "id": "metric-card", "name": "Metric Card", "category": "metric",
      "intent": "Show one key metric with an optional trend delta.",
      "manifest": "widgets/metric-card/metric-card.manifest.json" },
    { "id": "worker-grid", "name": "Worker Grid", "category": "data",
      "intent": "Browse, sort, filter, page a worker roster.",
      "manifest": "widgets/worker-grid/worker-grid.manifest.json" },
    { "id": "trend-chart", "name": "Trend Chart", "category": "chart",
      "intent": "Plot a metric over time.",
      "manifest": "widgets/trend-chart/trend-chart.manifest.json" }
  ]
}
```

### `template-index.json` (illustrative)
```json
{
  "version": "0.1.0",
  "tier": "template",
  "templates": [
    { "id": "org-overview", "name": "Organization Overview", "category": "dashboard",
      "pageIntent": "At-a-glance org health: KPIs, trends, recent activity.",
      "manifest": "templates/org-overview/org-overview.manifest.json" }
  ]
}
```

> **Gap G1:** the index needs a `schemaVersion` and each entry a `version`, so the builder can refuse
> or migrate a manifest it doesn't understand. Added above as `version`; per-entry version still TODO.

---

## 2. User/agent selects `org-overview`

Builder action: `GET templates/org-overview/org-overview.manifest.json`.

---

## 3. Builder reads the template manifest

### `templates/org-overview/org-overview.manifest.json` (full)
```json
{
  "id": "org-overview",
  "tier": "template",
  "name": "Organization Overview",
  "version": "1.0.0",
  "schemaVersion": "tier-manifest/0.1",
  "pageIntent": "At-a-glance health of the whole org: KPIs, trends, and recent activity.",
  "when": ["Landing page for an org-level role", "Exec / manager dashboards"],

  "layout": {
    "type": "app-shell",
    "regions": [
      { "id": "header",   "intent": "page title + global filters", "span": "full", "maxItems": 1 },
      { "id": "kpis",     "intent": "row of metric widgets",       "span": "full", "minItems": 3, "maxItems": 6 },
      { "id": "trends",   "intent": "two-column chart widgets",    "columns": 2,   "minItems": 1, "maxItems": 4 },
      { "id": "activity", "intent": "recent activity feed",        "optional": true }
    ]
  },

  "requiredWidgets": [
    { "region": "kpis",   "widget": "metric-card", "min": 3, "max": 6 },
    { "region": "trends", "widget": "trend-chart", "min": 1 }
  ],
  "optionalWidgets": [
    { "region": "activity", "widget": "activity-feed" }
  ],

  "dataSources": {
    "scope": { "intent": "current org + selected date range", "shape": { "orgId": "string", "from": "date", "to": "date" } }
  },
  "dataFlow": [
    { "from": "header.filters", "to": ["kpis.*", "trends.*"], "as": "scope" }
  ],

  "responsive": { "kpis": "4-col → 2-col → 1-col", "trends": "2-col → 1-col stacked" },
  "requiredProviders": ["SidebarProvider"],

  "successCriteria": [
    { "id": "order",     "check": "kpis region renders above trends (DOM order)", "metric": "structure" },
    { "id": "loading",   "check": "a loading state is present while scope resolves", "metric": "states" },
    { "id": "filled",    "check": "every required region filled with an allowed widget within min/max", "metric": "composition" },
    { "id": "behavioral","check": "page compiles + renders", "metric": "behavioral" }
  ],

  "knowledgeLevel": "full",
  "provenance": { "authoredFields": ["pageIntent","when","dataFlow"], "lastValidated": "2026-06-25" }
}
```

The builder now knows: 4 regions, which widgets are required where (with cardinality), the shared
`scope` data source, that the header filter fans out to all KPI + trend widgets, and the responsive
collapse rules.

> **Gap G2 — region cardinality lived in two places.** `requiredWidgets[].min/max` duplicated
> `regions[].minItems/maxItems`. Pick one home (recommend cardinality on `requiredWidgets`, regions
> just describe layout). **[DECISION]**
>
> **Gap G3 — `dataSources` was missing from the template manifest** in TIER-ARCHITECTURE.md. The
> `dataFlow.as: "scope"` referenced a source that was never declared. Added a `dataSources` block so
> the binding target is defined.

---

## 4. Builder sees `metric-card` is required in `kpis`

From `requiredWidgets`: region `kpis` needs 3–6 `metric-card`. Builder action:
`GET widgets/metric-card/metric-card.manifest.json`.

---

## 5. Builder reads the `metric-card` widget manifest

### `widgets/metric-card/metric-card.manifest.json` (full)
```json
{
  "id": "metric-card",
  "tier": "widget",
  "name": "Metric Card",
  "category": "metric",
  "version": "1.0.0",
  "schemaVersion": "tier-manifest/0.1",
  "intent": "Show a single key metric with an optional trend delta and label.",
  "when": ["A KPI/summary number at the top of a dashboard", "One figure that deserves emphasis"],
  "chooseOver": [
    { "over": "Card (component)", "because": "Metric Card standardizes label/value/delta + loading; a raw Card is unstructured" }
  ],

  "dataContract": {
    "input": {
      "label": { "type": "string", "required": true },
      "value": { "type": "number | string", "required": true },
      "delta": { "type": "{ direction: 'up'|'down'|'flat', pct: number }", "required": false }
    },
    "events": {},
    "dataSource": { "mode": "injected", "bindable": true, "scopedBy": "scope" }
  },

  "configSchema": {
    "format":   { "type": "enum", "values": ["number","currency","percent"], "default": "number" },
    "emphasis": { "type": "enum", "values": ["default","strong"], "default": "default" },
    "showDelta":{ "type": "boolean", "default": true }
  },
  "defaultConfig": { "format": "number", "emphasis": "default", "showDelta": true },

  "slots": {
    "footer": { "description": "small print / link under the value", "accepts": ["component"], "required": false }
  },

  "composedOf": ["Card", "Typography", "Badge"],
  "variants": [ { "id": "compact", "intent": "denser cell for 6-up KPI rows" } ],
  "requiredProviders": [],
  "allowedPlacement": ["content-region", "kpis", "dialog"],

  "states": {
    "loading": "skeleton in place of value",
    "empty":   "em dash when value is null",
    "error":   "inline error glyph + tooltip"
  },

  "commonMistakes": [
    { "wrong": "six raw <Card> elements for KPIs", "why": "no shared loading/delta semantics, drifts visually", "right": "use metric-card per KPI" },
    { "wrong": "passing a pre-formatted string as value with format=currency", "why": "double-formats", "right": "pass a number; let format handle it" }
  ],
  "minimalExample": {
    "declarative": { "widget": "metric-card", "config": { "format": "currency" }, "data": { "label": "Revenue", "value": "$scope.revenue" } },
    "code": "<MetricCard label=\"Revenue\" value={revenue} format=\"currency\" />"
  },

  "evaluationCriteria": [
    { "id": "selection",     "check": "chosen for a single-KPI need (not raw Card, not a table)", "metric": "selection" },
    { "id": "data-contract", "check": "label + value provided; value is number when format≠'number'", "metric": "data-contract" },
    { "id": "config-valid",  "check": "format ∈ enum; no unknown config keys", "metric": "config-valid" },
    { "id": "placement",     "check": "placed in an allowedPlacement region", "metric": "placement" },
    { "id": "render",        "check": "renders without crash", "metric": "render" }
  ],

  "knowledgeLevel": "full",
  "provenance": { "authoredFields": ["intent","when","chooseOver","commonMistakes"], "generatedFields": ["composedOf"], "lastValidated": "2026-06-25" }
}
```

> **Gap G4 — `states` (loading/empty/error) wasn't in the strawman widget schema** but the template's
> `loading` success-criterion can't be satisfied without it. Added.
>
> **Gap G5 — data binding syntax undefined.** The example uses `"$scope.revenue"` / `"$workers"` but
> nothing specifies the binding grammar (how `dataSource.scopedBy: "scope"` connects a widget input to
> the template's `scope` source). Needs a tiny **binding spec** (see §6). This is the single biggest
> gap.

---

## 6. Builder configures the widget declaratively → the page-instance model

This is the artifact the **TIER-ARCHITECTURE strawman didn't have at all** and the walkthrough proved
is required: manifests describe *types*; a built page is a tree of *instances*. The builder produces
and persists this:

### Sample page-builder state — `page.instance.json`
```json
{
  "schemaVersion": "page-instance/0.1",
  "templateRef": { "id": "org-overview", "version": "1.0.0" },
  "dataSources": {
    "scope": { "binding": "app.currentScope", "shape": { "orgId": "string", "from": "date", "to": "date" } }
  },
  "regions": {
    "header": [
      { "instanceId": "h1", "widget": null, "slotFills": {}, "note": "title + filter chrome from template layout" }
    ],
    "kpis": [
      { "instanceId": "k1", "widget": "metric-card", "version": "1.0.0",
        "config": { "format": "currency", "showDelta": true },
        "data": { "label": "Revenue", "value": "{{scope.revenue}}", "delta": "{{scope.revenueDelta}}" },
        "slotFills": {} },
      { "instanceId": "k2", "widget": "metric-card", "version": "1.0.0",
        "config": { "format": "number" },
        "data": { "label": "Active workers", "value": "{{scope.activeWorkers}}" } },
      { "instanceId": "k3", "widget": "metric-card", "version": "1.0.0",
        "config": { "format": "percent" },
        "data": { "label": "Safety compliance", "value": "{{scope.safetyPct}}", "delta": "{{scope.safetyDelta}}" } }
    ],
    "trends": [
      { "instanceId": "t1", "widget": "trend-chart", "version": "1.0.0",
        "config": {}, "data": { "series": "{{scope.revenueSeries}}" } }
    ],
    "activity": []
  }
}
```

Binding grammar (proposed, minimal): `{{<source>.<path>}}` resolves against `dataSources`; the builder
validates each `{{…}}` target exists in the named source's `shape` and that the resolved type satisfies
the widget's `dataContract`. `config` is validated against the widget `configSchema` (enums, unknown
keys, types). `defaultConfig` fills anything omitted.

> **Gap G6 — instance model + binding grammar are net-new** (added here as `page-instance/0.1` +
> `{{…}}`). Without them, "configure declaratively" is undefined. This is the core deliverable of the
> walkthrough.
>
> **Gap G7 — versioning at the instance level.** Each instance pins `version`; the builder needs a
> rule for template/widget version drift (pin vs. auto-migrate). **[DECISION]**

---

## 7. What the agent understands (context assembled from manifests)

The agent's context for "fill the KPIs region" is assembled from the manifests — no prose duplication:

### Sample agent context (rendered from manifests)
```
You are filling the `kpis` region of the `org-overview` template.
- Region intent: row of metric widgets. Cardinality: 3–6. Allowed widget: metric-card.
- WHY metric-card here: "Show a single key metric…"; chooseOver Card because it standardizes
  label/value/delta + loading.
- DATA it needs: label (string, required), value (number|string, required), delta (optional).
  Bind values from the template `scope` source via {{scope.<path>}}.
- CONFIG: format ∈ number|currency|percent (default number); showDelta (default true).
- AVOID: six raw <Card> elements (no shared semantics); passing a pre-formatted string with
  format=currency (double-formats).
- PLACEMENT ok: kpis ✓.
Produce a page-instance fragment for region `kpis`.
```

> **Gap G8 — "highest-tier-first" needs to be an explicit instruction**, not implied. The agent must
> be told to prefer template→widget→component, or it'll reach for raw Cards (exactly the `commonMistake`).

---

## 8. Eval checks (this example)

Reusing the ablation harness with a `tier` field; graders map 1:1 to the manifests' `evaluationCriteria`
+ template `successCriteria`:

| Check | Source | Grader metric |
|---|---|---|
| Correct tier selected (template over ad-hoc page; metric-card over raw Card) | both manifests | `tier-selection` |
| metric-card placed in `kpis` (an allowedPlacement) | widget `allowedPlacement` + template region | `placement` |
| Data contract satisfied (label+value present, types ok, bindings resolve) | widget `dataContract` + bindings | `data-contract` |
| Config valid (enums, no unknown keys) | widget `configSchema` | `config-valid` |
| Region cardinality met (3–6 KPIs) | template `requiredWidgets` | `composition` |
| Page renders | behavioral grader (existing) | `render` |

### Sample eval task (`tier: template`)
```json
{
  "id": "org-overview-assembly",
  "tier": "template",
  "prompt": "Build an organization overview landing page showing the org's key metrics at the top and a revenue trend below; show a loading state while data resolves.",
  "expectedTemplate": "org-overview",
  "expectedWidgets": [{ "region": "kpis", "widget": "metric-card", "min": 3 }, { "region": "trends", "widget": "trend-chart", "min": 1 }],
  "forbidden": ["six raw Card components in kpis"],
  "successCriteria": ["tier-selection", "placement", "data-contract", "config-valid", "composition", "render"]
}
```

> **Gap G9 — graders consume `evaluationCriteria`/`successCriteria` directly.** That's good (manifest =
> source of truth for its own eval), but it means an agent that *authors a manifest* could also author
> its own (weak) test. Keep manifest-authoring and held-out eval tasks **separate-authored** to avoid
> the teach-the-test problem we already hit at the component tier.

---

## 9. Does the schema survive? Verdict

**Mostly yes** — the static descriptive fields (intent/when/chooseOver/configSchema/dataContract/
slots/allowedPlacement/commonMistakes/evaluationCriteria) were sufficient for the builder to discover,
select, and *describe* the widget, and for the agent to reason about it. **But** the walkthrough proved
the strawman was missing the entire **runtime/consumption half**: an instance model, data binding, and
fill rules. Those aren't optional — without them "the builder consumes the manifest" is undefined.

---

## 10. Gaps discovered (the actual output)

| # | Gap | Fix | Severity |
|---|-----|-----|----------|
| G1 | No `schemaVersion` / per-entry version in indexes | add both | med |
| G2 | Region cardinality duplicated (regions vs requiredWidgets) | one home **[DECISION]** | low |
| G3 | Template had no `dataSources` block (dataFlow referenced an undeclared source) | add `dataSources` | **high** |
| G4 | Widget schema lacked `states` (loading/empty/error) | add `states` | **high** |
| G5 | No data-binding grammar | define `{{source.path}}` + validation | **high** |
| G6 | No page-instance model (manifests are types; page is instances) | add `page-instance/0.1` | **critical** |
| G7 | No instance-level version-drift rule | pin vs auto-migrate **[DECISION]** | med |
| G8 | "highest-tier-first" not an explicit agent instruction | add to the entry skill | med |
| G9 | Manifest self-authors its own eval (teach-the-test risk) | separate-author held-out tasks | med |

**Recommended before authoring real widgets:** resolve G6 (instance model), G5 (binding), G3+G4
(template dataSources + widget states) — they're the load-bearing four. G2/G7 are quick decisions;
G1/G8/G9 are cheap hygiene.

---

## 11. Scope guardrails honored
No runtime components, no packages, no widgets authored, single example only. This validates (and
amends) the manifest schema so the next step — authoring the 3-widget/1-template pilot — starts from a
consumption-proven format.
