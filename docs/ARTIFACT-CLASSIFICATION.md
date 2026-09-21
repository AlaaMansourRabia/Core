# WakeCore artifact classification — Components → Widgets → Templates

> Architectural audit of the **entire current export surface** (122 export subpaths → 118 UI artifacts
>
> - 4 non-UI exports), classified by _architectural responsibility_, not by folder. Supersedes and
>   sharpens `docs/COMPONENT-AUDIT.md` where that audit was too soft. **Classification and planning only
>   — no files moved, no exports changed, no APIs touched, no widgets/templates built.**
>
> Taxonomy: **Component** = generic UI primitive, no domain meaning, no data contract beyond generic
> props, could live in another design system. **Widget** = composed product building block, reusable
> across pages, has product meaning + data/config/state. **Template** = page-level composition that owns
> layout/regions. **Utility/Pattern** = hook/provider/mount-point/non-visual helper. **Unclear** =
> genuine coin-flip flagged for a human call.

---

## 1. Executive summary

| Classification                                                                |         Count (of 118 UI artifacts) |
| ----------------------------------------------------------------------------- | ----------------------------------: |
| **Component**                                                                 |                              **71** |
| **Widget candidate**                                                          |                              **32** |
| **Template candidate**                                                        |                               **9** |
| **Product-only page route (not a catalog artifact)**                          |                               **3** |
| **Utility / Pattern**                                                         | **3** (+4 non-UI exports → 7 total) |
| _— of which **flagged Unclear** (provisional call given, needs ratification)_ |                                 _9_ |

**Biggest finding.** The widget and template tiers already physically exist inside `@wakecap/core-ui`
— and the codebase _already half-admits it_ through three export namespaces:

- `pages/*` contains the page-level surface. Most are template candidates, while `CoreOrgOverview`,
  `CoreOrgRealityCapture`, and `CoreOrgAiReport` are deliberate product-only route exclusions and
  `CoreContentArea` is a utility.
- `navigation/core-*` and `chat/*` (14 exports) — **all widgets** (branded, composed, data-bearing).
- The **`Core*` prefix is the product-tier marker**: with one deliberate exception set, _every_ `Core*`
  export is a widget or a template, and _no_ generic primitive is `Core*`-prefixed. That prefix is the
  single most reliable signal in the library.

So **~40% of the "component" library is not components.** Nothing needs to be invented — the first ~32
widgets and ~12 templates are sitting in the library waiting to be _named_.

**What changed from the prior audit (`COMPONENT-AUDIT.md`).** That audit got the shape right (~half
aren't generic) but was soft and fuzzy in three places. Corrections:

1. **Chat tier split — the prior audit was wrong to call all 12 chat exports widgets.** Four of them —
   `ToolCall`, `ThinkingPill`, `TurnTimer`, `PromptInput` — are **generic AI primitives** (they'd exist
   in _any_ AI design system; they carry no WakeCap product meaning) and are even **exported flat**, not
   under `chat/`. They are **Components**. Only the 8 `Core*` chat surfaces are widgets. (−4 widgets.)
2. **`Chart` is a Widget; `Timeline` remains a Component.** Chart owns the ECharts lifecycle, responsive
   resizing, and semantic theme-to-canvas color translation. `CoreChartRenderer` remains the specialized
   widget for AI-generated chart payloads. Timeline remains a generic dated-event primitive.
3. **The prior "~6 unclear" bucket is resolved** to firm calls (with confidence levels), and `CoreContentArea`
   is moved from "template" to **Utility** (it's an app-shell layout region, not a page).

Net vs prior: **more components (71 vs ~63), fewer widgets (32 vs ~36)** — a _stricter_ component bar.
The library is more disciplined than the prior audit implied, and the widget set is smaller but cleaner.

**Three structural smells worth your attention up front** (detailed in §6/§7-equivalent below):

- **Filter sprawl:** `Filter` + `SearchFilterBar` + `CoreFilterStrip` are three overlapping filter artifacts.
- **Tab sprawl:** `Tabs` + `BrowserTabs` + `ViewTabBar` + `CoreContextTabs` are four tab artifacts.
- **Page-family duplication:** the `CoreOrg*`/`CoreProject*` routes share several widgets, but should be
  classified by their actual page family instead of being collapsed into a selectable Dashboard template.

---

## 2. Full classification table

Export paths are relative to `@wakecap/core-ui`. "Loc" = current library-index category. Confidence:
**H**igh / **M**edium / **L**ow. ⚠ = flagged Unclear (see §5).

### 2a. Components (71)

**Primitives (21) — all Component, H.** Generic controls, no data contract beyond props.

| Export                                                                                                                                                                                                                             | Reason                                                                    |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `button`, `button-group`, `input`, `input-group`, `textarea`, `select`, `checkbox`, `radio-group`, `switch`, `toggle`, `toggle-group`, `slider`, `label`, `badge`, `avatar`, `kbd`, `spinner`, `progress`, `skeleton`, `separator` | Textbook generic primitives; would drop into any design system unchanged. |

**Overlay (10) — all Component, H.** Generic interaction primitives.

| Export                                                                                                                      | Reason                                                       |
| --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `dialog`, `alert-dialog`, `sheet`, `drawer`, `popover`, `tooltip`, `hover-card`, `dropdown-menu`, `context-menu`, `menubar` | Generic surfaces/menus; no domain meaning, no data contract. |

**Layout (11 of 12) — Component, H** (except `data-table`).

| Export                                                                                                  | Conf | Reason                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------- | :--: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `card`, `table`, `tabs`, `accordion`, `collapsible`, `scroll-area`, `aspect-ratio`, `resizable`, `item` |  H   | Generic containers/structure.                                                                                                                                       |
| `sidebar`                                                                                               |  H   | Composable **primitive set** (provider/menu/trigger) for building a sidebar — generic toolkit, not the branded product sidebar (that's `CoreAppSidebar`, a widget). |
| `push-panel`                                                                                            |  M   | Generic "push content aside" panel; 13 subcomponents but no domain/data — stays a component.                                                                        |

**Navigation (7 of 13) — Component, H.**

| Export                                                                                              | Reason                                                                                                                                                                           |
| --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `navigation-menu`, `breadcrumb`, `pagination`, `command`, `stepper`, `browser-tabs`, `view-tab-bar` | Generic navigation primitives. `stepper` is the wizard _primitive_ (the wizard _template_ doesn't exist yet). `browser-tabs`/`view-tab-bar` overlap `tabs` (see tab sprawl, §5). |

**Form (7 of 9) — Component.**

| Export                          | Conf | Reason                                                                                                                                |
| ------------------------------- | :--: | ------------------------------------------------------------------------------------------------------------------------------------- |
| `form`, `field`                 |  H   | RHF+Zod context + field wiring — generic form infra (no domain).                                                                      |
| `input-otp`, `calendar`, `chip` |  H   | Generic inputs/pills.                                                                                                                 |
| `combobox`, `date-picker`       | M ⚠  | Composed (Popover+Command / Popover+Calendar) but **generic** — any design system ships these. Composition ≠ widget. Stay components. |

**Feedback (5 of 8) — Component.**

| Export            | Conf | Reason                                                                                                           |
| ----------------- | :--: | ---------------------------------------------------------------------------------------------------------------- |
| `alert`, `banner` |  H   | Generic inline/section messages.                                                                                 |
| `empty`           | M ⚠  | Zero-state placeholder — generic pattern; borderline "widget" only if it grows a data contract. Stays component. |
| `sonner`          |  H   | Generic transient-toast component.                                                                               |
| `toast`           |  H   | Generic toast primitive — **but a deprecated duplicate of `sonner`** ("prefer Sonner"); see §5.                  |

**Display primitives — Component.**

| Export                                              | Conf | Reason                                                              |
| --------------------------------------------------- | :--: | ------------------------------------------------------------------- |
| `carousel`, `typography`, `tree-row`, `copy-button` |  H   | Generic presentational primitives.                                  |
| `timeline`                                          | M ⚠  | Generic vertical dated-event list — could ship anywhere. Component. |

**Chat (4 of 12) — Component, the generic AI primitives.**

| Export          | Conf | Reason                                                                                                                        |
| --------------- | :--: | ----------------------------------------------------------------------------------------------------------------------------- |
| `prompt-input`  | M ⚠  | Composable AI prompt input (auto-size textarea + attachments) — a generic AI primitive; exported **flat**, not under `chat/`. |
| `tool-call`     | M ⚠  | Collapsible agent tool/function-call display — generic agent-UI primitive.                                                    |
| `thinking-pill` | L ⚠  | "Agent is processing" indicator — tiny, presentational, generic AI primitive.                                                 |
| `turn-timer`    | L ⚠  | Mono duration counter for an agent turn — generic AI primitive.                                                               |

### 2b. Widget candidates (32)

Full detail (composition / data contract / manifest / priority) in §3. Master rows:

| Export                                 | Loc     | Conf | Reason (one line)                                                                         |
| -------------------------------------- | ------- | :--: | ----------------------------------------------------------------------------------------- |
| `data-table`                           | layout  |  H   | Data grid; `columns`/`data` contract; sort/filter/paginate/states — the canonical widget. |
| `navigation/core-app-sidebar`          | nav     |  H   | Branded product sidebar shell; nav-config contract.                                       |
| `navigation/core-app-top-bar`          | nav     |  H   | Product top bar; switcher/breadcrumb/actions config.                                      |
| `navigation/core-context-tabs`         | nav     |  M   | Page-level context tabs bound to current entity.                                          |
| `navigation/core-filter-strip`         | nav     |  M   | Filter-chip strip above a data view (overlaps Filter/SearchFilterBar).                    |
| `navigation/core-dashboard-header`     | nav     |  M   | Dashboard page header: title/meta/actions block.                                          |
| `navigation/core-org-project-switcher` | nav     |  M   | Org/project switcher; data-bound.                                                         |
| `filter`                               | form    |  H   | Faceted multi-category filter; column/option config + state.                              |
| `search-filter-bar`                    | form    |  H   | Search + quick-filter pills with counts; config + state.                                  |
| `gantt`                                | display |  H   | Schedule of task bars + dependencies; rich data contract.                                 |
| `map`                                  | display |  H   | Interactive geospatial map; markers/layers data.                                          |
| `map-controls`                         | display |  M   | Zoom/layer/draw controls bound to a Map (Map sub-widget).                                 |
| `calendar-view`                        | display |  H   | Month grid laying out **events** (toned) — event data contract.                           |
| `activity-log`                         | display |  H   | Chronological activity feed; entries data contract.                                       |
| `task-monitor`                         | display |  H   | Monitors a stream of tasks/alerts; list + empty-state contract.                           |
| `work-item-card`                       | display |  H   | Work-item (task/issue) summary card; domain object contract.                              |
| `property-list`                        | display | M ⚠  | Labeled `<dl>` of properties; simple `items` contract. Borderline component (§5).         |
| `comment-thread`                       | display |  H   | Threaded comments with replies; comment-tree contract.                                    |
| `comment-composer`                     | display |  M   | Tiptap rich-text comment editor; controlled HTML value.                                   |
| `inline-comment-composer`              | display |  M   | Lightweight inline reply composer (overlaps comment-composer).                            |
| `setup-steps-checklist`                | display |  H   | Onboarding/setup checklist; steps + completion-state contract.                            |
| `canvas-toolbar`                       | display | L ⚠  | Blueprint/canvas toolbar — domain-ish toolbar (§5).                                       |
| `drawing-actions`                      | display | L ⚠  | Canvas draw/select tool group (§5).                                                       |
| `zoom-tools`                           | display | L ⚠  | Zoom in/out/reset with multiplier — nearly generic (§5).                                  |
| `chat/core-chat-widget`                | chat    |  H   | Floating AI assistant entry point; `apiEndpoint`/`onAddWidget` contract.                  |
| `chat/core-chat-panel`                 | chat    |  H   | Expanded chat panel (message list + input).                                               |
| `chat/core-chat-input`                 | chat    |  M   | Chat composer (prompt/send/attachments) — product chat sub-widget.                        |
| `chat/core-chat-message`               | chat    |  M   | Renders a chat message (text/chart/dashboard types) — typed contract.                     |
| `chat/core-chart-renderer`             | chat    |  M   | Renders AI-generated chart payloads in messages.                                          |
| `chat/core-ai-chat`                    | chat    |  H   | Inline AI chat surface (distinct from floating widget).                                   |
| `chat/core-ai-chat-header`             | chat    |  M   | Header bar for an AI chat (title/usage + actions).                                        |
| `chat/core-ai-chat-message`            | chat    |  M   | Single AI-chat message bubble (user pill / assistant block).                              |

### 2c. Template candidates (9)

| Export                                  | Loc      | Conf | Reason                                                                                          |
| --------------------------------------- | -------- | :--: | ----------------------------------------------------------------------------------------------- |
| `pages/core-login-page`                 | pages    |  H   | Full login page (brand + form + providers).                                                     |
| `pages/core-org-performance`            | pages    |  H   | Org performance page.                                                                           |
| `pages/core-org-workforce-intelligence` | pages    |  H   | Org workforce-intelligence page.                                                                |
| `pages/core-project-overview`           | pages    |  H   | Project overview dashboard.                                                                     |
| `pages/core-project-quality-issues`     | pages    |  H   | Project quality-issues page.                                                                    |
| `pages/core-project-reality-capture`    | pages    |  H   | Project reality-capture page.                                                                   |
| `pages/core-project-schedule-cost`      | pages    |  H   | Project schedule & cost page.                                                                   |
| `pages/core-project-workforce-safety`   | pages    |  H   | Project workforce & safety page.                                                                |
| `error-page`                            | feedback |  H   | Full-page error state (404/500/permission) with recovery — a **template filed as a component**. |

### 2d. Utility / Pattern (3 UI + 4 non-UI)

| Export                    | Conf | Reason                                                                                            |
| ------------------------- | :--: | ------------------------------------------------------------------------------------------------- |
| `toaster`                 |  H   | Mount point that renders Sonner toasts — infrastructure, not a UI artifact.                       |
| `use-toast`               |  H   | Hook (imperative toast trigger) — non-visual pattern.                                             |
| `pages/core-content-area` |  H   | App-shell content region (padding/scroll/max-width) — a layout region, not a page or a component. |
| `types`, `types/chat`     |  H   | Type-only exports.                                                                                |
| `data/mock-data`          |  H   | Fixture data.                                                                                     |
| `services/chatService`    |  H   | Service/IO layer — non-UI.                                                                        |

---

## 3. Strongest widget candidates (promote first)

Priority = (clean data contract) × (cross-page reuse) × (strategic value). "Composes" is inferred from
intent/`pairsWith`/naming — **confirm at manifest-authoring time** (the manifest is where composition is
nailed down).

|   # | Widget                          | Why it's a widget                                                             | Likely composes                                         |             Implicit data contract today?             |                 Needs widget manifest?                  | Priority |
| --: | ------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------- | :---------------------------------------------------: | :-----------------------------------------------------: | :------: |
|   1 | **`data-table`**                | The archetypal data-bearing widget: schema-driven columns, server-ish states. | Table, Checkbox, DropdownMenu, Pagination, Input, Badge |  **Yes** — `columns`, `data`, sort/filter/page state  |             **Yes** (flagship — start here)             |  **P1**  |
|   2 | **`core-app-sidebar`**          | Branded app-shell nav; high reuse; config-driven.                             | Sidebar (primitive), Button, Avatar, Tooltip, Badge     | **Yes** — nav-item tree, active route, collapse state |                         **Yes**                         |  **P1**  |
|   3 | **`core-app-top-bar`**          | App-shell header; pairs with sidebar across every page.                       | OrgProjectSwitcher, Breadcrumb, Button, DropdownMenu    |       **Yes** — title/breadcrumb, actions, user       |                         **Yes**                         |  **P1**  |
|   4 | **`search-filter-bar`**         | Search + faceted pills + counts; reused above every list.                     | Input, Chip/Badge, Popover, Button                      |        **Yes** — query + facet config + counts        |                         **Yes**                         |  **P1**  |
|   5 | **`filter`**                    | Faceted multi-category filter popover.                                        | Popover, Command, Checkbox, Badge                       |    **Yes** — facet/column schema + selection state    | **Yes** (consolidate with #4/`core-filter-strip` first) |  **P1**  |
|   6 | **`core-chat-widget`**          | Strategic AI surface; explicit IO contract.                                   | ChatPanel, ChatInput, ChatMessage, PromptInput          |   **Yes** — `apiEndpoint`, handlers, message stream   |                         **Yes**                         |  **P1**  |
|   7 | **`map`**                       | Geospatial product surface; data-bound.                                       | MapControls, Button, DropdownMenu                       |           **Yes** — markers/layers/viewport           |                         **Yes**                         |  **P2**  |
|   8 | **`gantt`**                     | Recognizable scheduling feature; rich data.                                   | (9 subcomponents) Table-ish rows, bars, deps            |         **Yes** — tasks, dependencies, dates          |                         **Yes**                         |  **P2**  |
|   9 | **`calendar-view`**             | Event-calendar feature (distinct from `calendar` primitive).                  | Calendar primitive, Badge/tones, Popover                |           **Yes** — events with tones/dates           |                         **Yes**                         |  **P2**  |
|  10 | **`activity-log`**              | Activity-feed building block; common on detail pages.                         | Item, Avatar, Badge, Separator                          |       **Yes** — feed entries (actor/verb/time)        |                         **Yes**                         |  **P2**  |
|  11 | **`task-monitor`**              | Task/alert stream panel with empty state.                                     | Card, Badge, Item, Empty                                |          **Yes** — task/alert list + states           |                         **Yes**                         |  **P2**  |
|  12 | **`work-item-card`**            | Domain object card (task/issue).                                              | Card, Badge, Avatar, DropdownMenu                       |              **Yes** — work-item object               |                         **Yes**                         |  **P2**  |
|  13 | **`comment-thread`**            | Commenting feature block.                                                     | Item, Avatar, CommentComposer                           |                **Yes** — comment tree                 |           Yes (after composer consolidation)            |  **P3**  |
|  14 | **`setup-steps-checklist`**     | Onboarding workflow block.                                                    | Checkbox/Progress, Item, Button                         |             **Yes** — steps + completion              |                           Yes                           |  **P3**  |
|  15 | **`core-org-project-switcher`** | Data-bound switcher reused in the top bar.                                    | DropdownMenu/Command, Avatar                            |        **Yes** — org/project list + selection         |                           Yes                           |  **P3**  |

**Read:** the first six (DataTable, the two app-shell widgets, the two filter widgets, the chat widget)
are the highest-leverage manifests — they're the most-reused and have the cleanest contracts. Start the
**Widget Manifest schema with `data-table`** (cleanest contract), then prove it generalizes on
`core-app-sidebar` (config-heavy, no row-data) so the schema covers both data- and config-shaped widgets.

---

## 4. Strongest template candidates (promote first)

|   # | Template                    | Why it's a template                                             | Likely contains (widgets/components)            |             Needs template manifest?             | Priority |
| --: | --------------------------- | --------------------------------------------------------------- | ----------------------------------------------- | :----------------------------------------------: | :------: |
|   1 | **`core-login-page`**       | Self-contained full page; clean regions (brand/form/providers). | Form, Field, Input, Button, Card                |    **Yes** — simplest first template manifest    |  **P1**  |
|   2 | **`error-page`**            | Bounded full-page state (404/500/permission).                   | Empty, Button, Typography                       | **Yes** — smallest template; good schema warm-up |  **P1**  |
|   3 | **`core-project-overview`** | Project landing page with its own lighter card-grid shape.      | DashboardHeader, DataTable, Charts, TaskMonitor |  Evaluate within the Detail/project page family  |  **P2**  |

**Current template call:** `CoreOrgOverview` and `CoreOrgRealityCapture` are exported product routes, not
selectable templates. Generic dashboards should use the `dashboard-page` pattern; spatial workspaces should
compose reusable artifacts such as `Map` and `MapControls`. Other page routes should be classified within
their actual Regular Dashboard, Detail, or System families.

---

## 5. Borderline / unclear cases — decisions needed

**AI-chat primitives — `prompt-input`, `tool-call`, `thinking-pill`, `turn-timer`.**
_Decision:_ are these **generic AI components** or **chat widgets**? My call: **Components** (they'd exist
in any AI design system; no WakeCap product meaning; exported flat). The decision matters because it sets
where the _line_ between "AI primitive" and "AI product widget" sits. If you plan a shipped AI design
system, keep them components; if AI chat is treated as one product feature, you might fold them into a
`chat` widget bundle. **Recommend: Component.**

**`data-table`.** Filed in layout; behaves as the canonical widget. _Decision:_ confirm it's the **widget
manifest pilot**. The only nuance: `table` (presentational) stays a component; `data-table` (schema +
state) is the widget. **Recommend: Widget, P1.**

**`chart`.** _Decision:_ **Widget**. It owns the ECharts instance lifecycle, responsive resizing, and semantic
theme-to-canvas color translation. `core-chart-renderer` remains distinct as the AI chart-payload widget.

**`empty`.** Zero-state pattern. **Component** unless it acquires a data/action contract (then a small widget).
Low stakes. **Recommend: Component.**

**`combobox` / `date-picker`.** Composed (Popover+Command / Popover+Calendar) but generic. **Composition is
not widgethood.** **Recommend: Component.** (Guards the bar against "anything composed = widget.")

**`core-app-sidebar` (and `core-app-top-bar`).** Widgets — but they're **app-shell-level**: they only make
sense composing into an **App Shell template that doesn't exist yet** (TopBar + Sidebar + `core-content-area`).
_Decision:_ create an `AppShell` template later, with these as its primary widgets. **Recommend: Widget now,
parents of a future `AppShell` template.**

**`property-list`.** A `<dl>` of label/value is arguably a generic component, but it has an `items` contract
and reads as a named block. _Decision:_ lowest-complexity widget vs component. **Recommend: Widget (M)** — it
has a data contract — but fine to leave as a component if you want a higher widget bar.

**`canvas-toolbar` / `drawing-actions` / `zoom-tools`.** _Decision:_ domain canvas widgets vs generic toolbars.
`zoom-tools` is nearly generic; `canvas-toolbar` is the most domain-specific. **Recommend: Widget (L)** as a
**Drawing Canvas widget family**, but acceptable to demote `zoom-tools` to component.

**Duplicate concepts (consolidation decisions):**

- **`toast` vs `sonner`** — `toast` is a **deprecated duplicate** ("prefer Sonner"). _Decision:_ mark `toast`
  deprecated in the catalog; plan removal. (No API change now.)
- **Filter sprawl: `filter` vs `search-filter-bar` vs `core-filter-strip`** — three overlapping filter
  artifacts. _Decision:_ define **one `FilterBar` widget contract**; treat the others as variants/presets
  before writing three manifests.
- **Tab sprawl: `tabs` vs `browser-tabs` vs `view-tab-bar` vs `core-context-tabs`** — four tab artifacts.
  _Decision:_ keep `tabs` (component); decide whether `browser-tabs`/`view-tab-bar` are component variants and
  `core-context-tabs` the one widget.
- **`comment-composer` vs `inline-comment-composer`** — two composers; fold into one widget with a `variant`.
- **`core-chat-widget` (floating) vs `core-ai-chat` (inline)** — two chat surfaces; confirm they're two
  presentations of one Chat widget family, not divergent implementations.
- **`calendar` vs `calendar-view` vs `date-picker`** — fine (picker vs inline grid vs event calendar), but
  the naming proximity confuses retrieval; document the distinction.

**Missing abstractions (not in the library, implied by the pages):**

- **`MetricCard` / `KPISummary`** widget — referenced by every dashboard; prototyped in the eval slice; not exported.
- **`WorkerGrid`** widget — a domain DataTable preset; named by PMs, absent as an artifact.
- **`AppShell`** template — TopBar + Sidebar + ContentArea; currently implicit.
- **`DetailPage` / `SettingsPage` / `WizardPage`** templates — common page shapes with no current artifact
  (`stepper` is the wizard primitive; no wizard template).

---

## 6. Recommended migration plan (no code moves)

**Stay as components (71).** All primitives, all overlays, generic layout/navigation/form/feedback, the
generic display primitives (`carousel`/`typography`/`timeline`/`tree-row`/`copy-button`), and the
four AI primitives (`prompt-input`/`tool-call`/`thinking-pill`/`turn-timer`). **Don't touch these.**

**Reclassify as widgets (32).** `data-table`; the 6 `navigation/core-*`; `filter` + `search-filter-bar`; the
15 display-domain artifacts; the 8 `chat/core-*`. _Reclassify = label + knowledge tier, not move._

**Reclassify as templates (9).** Exclude the product-only `CoreOrgOverview`, `CoreOrgRealityCapture`, and
`CoreOrgAiReport` routes; retain the remaining page-family templates plus `error-page`.

**The keystone step — make the tier explicit in data, before any folder move:**
Add a **`tier` field** (`component | widget | template | utility`) to every entry in `library-index.json`.
This single change:

- becomes the **one source of truth** the catalog, the Storybook IA, and the manifest gating all read;
- lets the Storybook **Catalog knowledge** block and `storySort` group by tier with zero file moves;
- makes "is this a widget?" a data question, not a folder question.

**Storybook navigation should mirror the tiers** (the `Widgets/` and `Templates/` placeholders already
exist from the IA work). Drive grouping from the new `tier` field via story titles — `Components/…`,
`Widgets/…`, `Templates/…` — reusing the title-driven sidebar. No code moves; just retitle the ~44
widget/template stories once the tier field lands (mechanical, like the prior IA pass).

**Manifest work, in order:**

1. **`data-table` widget manifest** — cleanest data contract; defines the schema.
2. **`core-app-sidebar` widget manifest** — config-shaped (no row data); proves the schema generalizes.
3. **`LoginPage` + `ErrorPage` template manifests** — small, bounded; validate the template schema's range.
   Keep the excluded organization pages as product routes; compose generic dashboards through the
   `dashboard-page` pattern and spatial workspaces through reusable map widgets.

**Eventual packages/folders (only when justified, not now).** Internal folders first:
`src/components/`, `src/widgets/`, `src/templates/` (the `chat/`, `navigation/core-*`, `pages/*` namespaces
already approximate this). Split into separate packages (`@wakecap/core-widgets`, `@wakecap/core-templates`)
**only** when release cadence or the dependency direction (widgets→components, templates→widgets) actually
demands it. Premature package splits buy nothing but coordination cost. Keep export paths stable; if you
later move, ship re-export shims for one minor.

---

## 7. Opinionated recommendation — **Route A (with one data change)**

**Take Route A: classify and document the tiers first; do not move code or change exports now.** Concretely,
Route A here = **add the `tier` field to `library-index.json`, surface it in the catalog + Storybook IA, and
write manifests — all without moving a single file or changing an export.**

Why not Route B (packages/folders now): the value of widgets/templates comes from **manifests and knowledge**,
not from their folder. Moving 44 files and re-cutting exports now creates churn, breaks consumer import paths,
forces a Chromatic re-baseline, and delivers _zero_ capability. You'd pay the cost before earning anything.

Why not pure status-quo: the tiers are currently invisible to tooling, so the catalog/IA/manifests can't act
on them.

**Route A captures ~90% of the benefit at ~5% of the cost:** the `tier` field makes the hierarchy real to
every consumer of the catalog, the Storybook IA already has the homes, and the manifest pilots (`data-table`,
`core-app-sidebar`, `LoginPage`, and `ErrorPage`) prove the schemas. **Graduate to Route C (hybrid: physically move only the
proven widgets/templates into `src/widgets/` and `src/templates/`)** _after_ the first manifests land and the
`tier` field has shaken out the borderline calls in §5 — i.e. move code only once it's earning its tier, with
re-export shims so no consumer breaks.

**One-line answer:** Route A now (tier field + docs + manifests), Route C later (move only what's proven),
never Route B (no speculative package split).
