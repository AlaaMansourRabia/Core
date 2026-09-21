# Component audit — classifying the 118, finding the first widgets/templates

> Execution report. Audits all 118 current "components", classifies each (component / widget candidate
> / template candidate / pattern-helper / unclear), compares against Storybook + catalog +
> `library-index.json`, lists gaps, and prioritizes enhancement. **No new widgets/templates built; no
> API changes.** Classification uses: _Component = generic primitive, no domain meaning, no data
> contract. Widget = composed, configurable, domain-meaningful, has data/config/states. Template =
> page/workflow built from multiple widgets/components._

## Headline finding

**~half of the 118 "components" are not generic components.** The widget and template tiers already
exist _inside_ the library — they're just filed as components:

| Classification                         | Count | Where                                                                                     |
| -------------------------------------- | ----: | ----------------------------------------------------------------------------------------- |
| **Component** (true generic primitive) |   ~63 | all primitives, all overlays, most layout/form/feedback, generic navigation, some display |
| **Widget candidate**                   |   ~36 | DataTable; the 6 `Core*` navigation; Filter + SearchFilterBar; ~15 display; all 12 chat   |
| **Template candidate**                 |   ~13 | all 11 `pages/` + ErrorPage + CoreContentArea (shell)                                     |
| **Pattern / helper**                   |    ~3 | useToast (hook), Toaster (mount point), CoreContentArea (shell wrapper)                   |
| **Unclear / borderline**               |    ~6 | Chart, Empty, ThinkingPill, TurnTimer, Combobox, DatePicker                               |

So the answer to _"where are the first real widgets/templates?"_ is: **the entire `chat` category, most of `display`, the `Core*` navigation items, and `DataTable` are widgets; the `pages/` category is templates.** No invention required — promote what exists.

## 1. Classification by category

**primitives (20) — all COMPONENT.** Button, ButtonGroup, Input, InputGroup, Textarea, Select, Checkbox, RadioGroup, Switch, Toggle, ToggleGroup, Slider, Label, Badge, Avatar, Kbd, Spinner, Progress, Skeleton, Separator. Generic, no data contract.

**layout (12).** COMPONENT: Card, Table, Tabs, Accordion, Collapsible, ScrollArea, AspectRatio, Resizable, Sidebar, Item, PushPanel. **WIDGET CANDIDATE: DataTable** (data contract: `columns`/`data`; sorting/filtering/pagination/states — the canonical widget).

**overlay (10) — all COMPONENT.** Dialog, AlertDialog, Sheet, Drawer, Popover, Tooltip, HoverCard, DropdownMenu, ContextMenu, Menubar. Generic interaction primitives.

**navigation (13).** COMPONENT: NavigationMenu, Breadcrumb, Pagination, Command, Stepper, BrowserTabs, ViewTabBar. **WIDGET CANDIDATE (6):** CoreContextTabs, CoreFilterStrip, CoreDashboardHeader, CoreOrgProjectSwitcher, CoreAppSidebar, CoreAppTopBar — branded, composed, product-meaningful, often data/config. _(CoreAppSidebar/CoreAppTopBar are borderline shell-level; they're widgets that compose into the app-shell template.)_

**form (9).** COMPONENT: Form, Field, InputOTP, Combobox, DatePicker, Calendar, Chip. **WIDGET CANDIDATE: Filter, SearchFilterBar** (faceted filter with counts; search+pills+config). _(Combobox/DatePicker are composed but generic → component.)_

**feedback (8).** COMPONENT: Alert, Toast, Toaster, Sonner, Empty, Banner. **TEMPLATE CANDIDATE: ErrorPage** (full-page 404/500 state). **HELPER: useToast** (hook). _(Empty borderline — zero-state; keep component.)_

**display (21) — the richest widget seam.** COMPONENT: Carousel, Typography, TreeRow, PropertyList, CopyButton. **WIDGET CANDIDATE (~15):** Chart, Gantt, Timeline, Map, MapControls, CalendarView, ActivityLog, TaskMonitor, WorkItemCard, CommentThread, CommentComposer, InlineCommentComposer, SetupStepsChecklist, CanvasToolbar, DrawingActions, ZoomTools. All composed + domain + data/config/states.

**chat (12) — all WIDGET CANDIDATE.** CoreChatWidget, CoreChatPanel, CoreChatInput, CoreChatMessage, CoreChartRenderer, CoreAiChat, CoreAiChatHeader, CoreAiChatMessage, ToolCall, PromptInput, ThinkingPill, TurnTimer. Domain (AI-chat) surfaces with data/config/state. _(ThinkingPill/TurnTimer are tiny/presentational — borderline component, but chat-domain → small widgets.)_

**pages (11) — TEMPLATE CANDIDATE unless explicitly excluded.** CoreLoginPage, CoreOrgPerformance, CoreOrgWorkforceIntelligence, CoreProjectOverview, CoreProjectQualityIssues, CoreProjectRealityCapture, CoreProjectScheduleCost, CoreProjectWorkforceSafety. **EXCLUDED PRODUCT PAGES: CoreOrgOverview, CoreOrgRealityCapture, and CoreOrgAiReport** (kept as application routes assembled from reusable widgets, not catalog templates). **HELPER/shell: CoreContentArea** (content wrapper — template-layout helper).

## 2. Coverage comparison (Storybook · catalog · library-index)

- **library-index:** all 118 present, all `intent`+`when`, **all priority-12 at `full`**. But across the whole set: `chooseOver` 73/118, `avoid` 37/118, `variantIntent` 8/118, `requires` 8/118. The 67 `concise` entries are the thin tail.
- **Storybook:** 124 real story files (excluding a stray worktree copy) — good breadth; thinness is uneven (below).
- **Catalog validator:** `0 errors, 4 warnings` after this batch (was 5 — fixed `PropertyList.pairsWith → PropertyRow`, a dangling reference). Remaining warnings are non-blocking pairsWith references worth a sweep.

## 3. Gaps found

**Knowledge (priority-12, in-schema, now fixed in this batch):**

- `Card.avoid` was empty → filled. `Form.chooseOver` was empty → filled. `Toast.avoid` was empty → filled. `PropertyList.pairsWith` dangling → fixed.
- Still thin in the priority set: `variantIntent` missing on Dialog/DataTable/Form/Stepper/Sonner/Toast/Input/Sidebar (several have no real variants — fine); Sonner/Toast `pairsWith` empty.

**Stories (priority-12 thinness, by size):** rich already — Button (608), Card (897), Dialog (581), DataTable (648), Tabs (383), Stepper (276), Form (248). **Thin / under-told (the real story gaps):**

- **Badge (47 lines, 5)** — variants only; no status-semantics, no with-icon, no count, no dark-mode example.
- **Input (75, 9)** — no error/disabled/with-addon/with-label states shown.
- **Sonner (77, 2)** — only 2 stories; missing success/error/info/promise/action toasts and the required `<Toaster/>` wiring demo.
- **Sheet (162, 6)** — sides covered; missing form-in-sheet, scroll, and the "Sheet vs Dialog" contrast.
- **Sidebar (164, 4)** — collapse/states under-shown.

**Schema gaps (cross-cutting — NOT added yet, flagged):** there is no first-class field for _when-NOT-to-use_, _commonMistakes_ (distinct from `avoid`), or _relatedComponents_ (distinct from `pairsWith`). The architecture's manifest family will introduce these; for now `avoid` + `chooseOver` carry the load.

**Promotion gaps:** ~36 widget candidates and ~13 template candidates are filed as components — they lack widget/template-tier knowledge (data contract, config schema, slots, allowed placement).

## 4. Prioritized enhancement batches

- **Batch 1 (priority-12 knowledge — DONE this pass):** filled the empty `avoid`/`chooseOver` gaps + fixed the dangling ref. All priority-12 verified at `full` with no empty decision fields.
- **Batch 1 (priority-12 stories — NEXT, see note):** enhance the 5 thin ones first — **Sonner, Badge, Input, Sheet, Sidebar** — then deepen states/usage on the rest.
- **Batch 2 (widget-candidate confirmation):** run the `DataTable` manifest design pilot (the data-bearing boundary case from the architecture doc) — it's the cleanest first real widget.
- **Batch 3 (the 67 `concise` components):** raise the long tail to `full` where decision-relevant (Combobox, DatePicker, Drawer, Popover, Command, Accordion…).

## 5. Report

**Components improved (this pass):** Card, Form, Toast (knowledge), PropertyList (bug fix). Verified: catalog 0 errors, warnings 5→4.

**Probably widgets (promote first):** DataTable, Filter, SearchFilterBar, the 6 `Core*` navigation items, and the high-value display set — Chart, Gantt, Map, CalendarView, ActivityLog, TaskMonitor, WorkItemCard, CommentThread. Plus the whole `chat` category.

**Probably templates:** the 11 `pages/` Core\* page templates + ErrorPage. CoreContentArea is the shell-layout helper they sit in.

**Catalog/story gaps:** thin stories on Sonner/Badge/Input/Sheet/Sidebar; missing state coverage broadly; no `commonMistakes`/`whenNot`/`relatedComponents` schema fields yet; 4 residual non-blocking catalog warnings.

**Recommended next batch:** the 5 thin priority stories (Sonner first — it's a daily-use component with only 2 stories and a known wiring trap), then the `DataTable` widget pilot.

**What changed for designers:** Card/Form/Toast now state what _not_ to do; once stories deepen, the thin five will show real states (errors, loading, toast variants) instead of just the happy path.

**What changed for engineers:** clearer "use X over Y" rationale on Form (vs raw form state) and Card; a fixed catalog reference; and an explicit distinction between selectable templates and exported product routes such as `CoreOrgOverview`.

**What changed for agents:** three previously-empty decision fields (`Card.avoid`, `Form.chooseOver`, `Toast.avoid`) now give agents the _why/why-not_; the dangling `PropertyList` reference no longer mis-routes retrieval; and the classification tells an agent which tier each artifact belongs to.

## Note on the story work (intellectual honesty)

Story enhancement is **visual** and gated by Storybook + Chromatic, which can't be run/verified in this
environment. Rather than blind-edit 12 story files and risk the Storybook build or flood Chromatic
baselines unverified, this pass did the **verifiable** half (knowledge + the catalog bug) and scoped
the stories precisely above. The thin-five story work should be done with Storybook running locally
(or accept that I write them to match the existing format without local visual verification) — say
which, and I'll execute Batch 1 stories next.
