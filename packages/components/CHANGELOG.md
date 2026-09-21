# @wakecap/core-ui

## 0.18.1

### Patch Changes

- Make the menu highlight perceptible in both themes (#279).

  `--menu-highlight` paints the row under the pointer or keyboard focus in `DropdownMenu`, `ContextMenu`,
  `Menubar`, `NavigationMenu`, `Select` and `Command`. Its light value sat 0.06 L off a white `--popover`,
  which measures **1.14:1** against the worst surface it opens over — reported as no visible hover twice.
  Dark was **1.20:1** against `--card`, held there by a ladder that required the highlight to stay below
  `--border`.

  - light `oklch(0.94 0 0)` → `oklch(0.89 0 0)` — #ebebeb → #dbdbdb, worst-surface contrast 1.14:1 → **1.33:1**
  - dark `oklch(0.28 0.007 70)` → `oklch(0.325 0.007 70)` — #2b2825 → #363430, 1.20:1 → **1.38:1**

  The dark palette is too compressed to put a perceptible band below `--border` (0.30), so the highlight
  now passes it, and the validator instead requires it to stay 0.02 L clear of the border rather than
  underneath it. `scripts/validators/theme-contrast.test.mjs` raises its floor from 1.12 to 1.28, so the
  old values can no longer come back.

  Not changed: the items keep `focus:bg-menu-highlight`. Radix focuses a menu item on pointer move, so
  the rule does fire on hover — measured live, the background painted both before and after this change.
  The defect was the colour, not the selector.

## 0.18.0

### Minor Changes

- 37f0d6c: Add `useOptionalFragmentViewer`, and stop reaching for a conditional hook call to get the same thing.

  A surface whose stage may or may not be a FragmentViewer — Workforce Map View renders a placeholder plan when it is not — had no null-tolerant way to read the viewer, so it wrapped `useFragmentViewer()` in a `try/catch`. That reads as a conditional hook call, and it swallows every other error the hook might raise, not just the missing-provider one.

  `useOptionalFragmentViewer()` reads the context directly and returns `null` outside a provider. `useFragmentViewer()` is unchanged and still throws, so nothing is loosened. Exported from `@wakecap/core-ui/fragment-viewer` beside its strict twin.

- 37f0d6c: Keep popover-based controls usable inside a `Dialog`, and bring the compliance document to parity with the certificate one.

  **Popover inside a Dialog (#294).** A modal `Dialog` sets `pointer-events: none` on `<body>` and hands `auto` back only to the overlay layers it knows about. A popover portalled to `document.body` is normally one of them — but not when the host app carries a second copy of `@radix-ui/react-dismissable-layer` beside core-ui's, because the two copies keep separate layer stacks. The popover then renders but is dead to the mouse: clicks land on the overlay instead, which reads as an outside interaction and dismisses it, so a `Combobox` in a dialog could not be searched or selected at all.

  `PopoverContent` and `SelectContent` now portal into the enclosing `DialogContent` by default, which sidesteps the negotiation — the popover is a descendant of an element that already has `pointer-events: auto`, and sits inside the dialog's focus scope rather than fighting it. Outside a dialog nothing changes. Measured: the popover still escapes an `overflow: hidden` dialog and positions identically.

  - `Combobox` gains `open`, `onOpenChange`, `modal` and `container`.
  - Every `DatePicker` variant gains `container` and `modal`.
  - `PopoverContent` and `SelectContent` gain `container` (pass `null` to force `document.body`).
  - New `useDialogContainer()` from `@wakecap/core-ui/dialog`, for handing the container to an overlay that is not built on our `Popover`.

  **WorkerProfile compliance document (#295).** A compliance check's `document` was `{name, attached?}` only, so a host with a presigned URL could name a file but never open it, leaving a dead "View document" label beside a hand-injected link.

  - `WorkerProfileComplianceItem["document"]` is now a `WorkerProfileComplianceDocument` — `WorkerProfileDocument` (`name`, `url`) plus `attached`.
  - New `onComplianceDocumentClick`, mirroring `onCertificateDocumentClick`, for files behind the host's own auth.
  - The document line follows the certificate's precedence: handler, then `url`, then plain text. `attached: false` still reads "No document" and offers nothing, so a stale `url` cannot become a live link.
  - Fixed the compliance status chip being cut off at a narrow panel's right edge: the header row now wraps, so the chip drops to its own line instead of overflowing.

- 37f0d6c: Add the `SiteImageViewer` widget (`@wakecap/core-ui/site-image-viewer`)

  The Site Image Viewer, promoted out of the storybook `site-image-viewer` story into the design system: a
  background site-plan image (aerial / blueprint) with a villa polygon overlay coloured by construction
  progress. A plain `<svg>` whose `viewBox` equals the image's natural pixel size sits over the `<img>`, so
  image-pixel villa points map 1:1 to the screen — no canvas library, no coordinate math.

  - Villas colour by their approved % across the SHA-1036 milestone ramp; unlinked footprints render grey,
    linked-but-no-progress render slate. Hovering a linked villa raises its stroke + name chip inline (no
    modal); the floating Approved-vs-Planned card (the DS `ProgressComparison`) is opt-in via the `hoverCard`
    prop and off by default. The `TabbedLegend` (top-right) keys the colours and doubles as the SPA
    (progress) ↔ Construction (variance) mode switch.
  - The milestone ramp helpers (`styleForVilla`, `approvedProgressToBucket`, `classifyVariance`,
    `MILESTONE_COLOR_RAMP`, `PROGRESS_LEGEND_ITEMS`, `VARIANCE_LEGEND_ITEMS`) and the `Villa` / `MapMode` /
    `SiteMeta` types are exported alongside the component.
  - `villas` is a prop (not bundled). The real ROSHN Almanar set (602 footprints, 4096×4096) ships as the
    separate `@wakecap/core-ui/site-image-viewer-fixtures` entry (`ALMANAR_VILLAS`, `ALMANAR_SITE_META`) so
    the widget stays lean.

  The `CaptureUiEnhanced` template now composes this widget for its map region.

- 37f0d6c: Add the `CaptureUiEnhanced` template (`@wakecap/core-ui/pages/capture-ui-enhanced`)

  A reality-capture progress workspace for a construction zone, promoted from a wakedex flow rebuild. A
  `CanvasHeader` (breadcrumb + built-in `WeekSelector` for the weekly capture timeline + refresh &
  full-screen) heads a three-pane body:

  - **Left rail** — search, a zone-progress card, a progress-distribution histogram, a villas-on-map
    list, and collapsible map-layer toggles (`Input` · `Collapsible` · `Switch`).
  - **Center map** — a choropleth grid of plot polygons + amenities with a floating view-mode switcher
    (Villa / Batch / Satellite / Drone) and an approved-progress legend (`Tabs`).
  - **Detail rail** — the selected villa's approved/planned/variance stats, a milestones table,
    progress-by-floor bars, and an evidence-chain strip; "View blueprints" opens a per-floor sheet
    `Dialog`.

  Self-contained demo data (no props); a shared `bucketOf()` colour ramp keeps the list, map, and
  legend in lockstep. Rendered under `Templates/Capture UI Enhanced` in Storybook, with a template
  manifest (`manifests/capture-ui-enhanced.template.json`) projected into the catalog.

## 0.17.1

### Patch Changes

- 9905497: Calendar: the month-navigation chevrons are now clickable across their whole area. react-day-picker v9 renders the nav before the month, so the `relative` month caption painted over it and only the chevrons' bottom 4px accepted a click. The nav is raised above the caption and passes clicks through its empty space, so `captionLayout="dropdown"` selects stay reachable. Every component built on `Calendar` gets the fix, including the `DatePicker` family, `DateTimePicker`, `DateRangeTimePicker`, `WeekSelector`, `TimestampPicker`, `TimeScrubber` and `InlineCommentComposer`.

## 0.17.0

### Minor Changes

- fb43898: Charts follow a theme switch instead of freezing on the theme they were first painted in ([#266](https://github.com/wakecap/Wakecore/issues/266))

  `useChartTheme()` resolved every colour from `getComputedStyle(document.documentElement)` inside a
  `useMemo` with empty deps, so it returned concrete RGB strings for whichever theme was live at first
  paint and never recomputed. Toggling `.dark` swapped the CSS variables underneath and nothing
  noticed: in a consumer app the bars of a bar chart disappeared entirely, still painted in the
  light-mode `--primary` on a dark card. `ChartContainer` had the same shape — it re-ran `setOption`
  only when `option` changed identity, which a caller memoising their option (the sensible thing) never
  does.

  - `useChartTheme()` now recomputes whenever the theme changes — a `class` or `data-theme` flip on
    `<html>`, or a system preference change.
  - `ChartContainer` re-applies its option on a theme change, not only on a new option, and takes
    `seriesThemes` so the tones are resolved inside the container rather than baked in by the caller.
    `TrendChart` passes its own `seriesThemes` through instead of pre-resolving them.
  - Axis labels, axis lines, ticks and gridlines are given the live theme's colours where the option
    leaves them unset. ECharts otherwise falls back to its built-in `#333` and `#ccc`, which are
    literals and do not invert either.
  - New `useThemeVersion()` export, for callers who resolve tokens themselves and need a dependency to
    key their own memo on.

  `createThemedChartOption` is unchanged and still resolves at call time; prefer the `seriesThemes`
  prop, or key your memo on `useThemeVersion()`.

- fb43898: a11y: `FormDialogField` labels are associated with their controls ([#265](https://github.com/wakecap/Wakecore/issues/265))

  The caption was a plain `<span>`, which cannot carry `for`, so every field inside every `FormDialog`
  was unlabelled to assistive technology — a screen reader announced "edit, blank" for an `Input` and a
  bare "combobox" for a select. It looked correct on screen, so visual review never caught it, and the
  component exposed no `id` and spread no props, so a consumer could not fix it from application code.
  WCAG 2.1 1.3.1 and 4.1.2.

  - The caption is now a real `Label` bound to the control.
  - The render prop receives `id`, `describedBy` (the hint line's id, for `aria-describedby`) and
    `labelId` alongside `invalid`. Callers that destructure only `{invalid}` keep working unchanged.
  - New `htmlFor` prop names a control the field cannot reach, for the plain-children form.
  - `Combobox` forwards `id`, `aria-label`, `aria-labelledby`, `aria-describedby` and `aria-invalid` to
    its trigger, which is what assistive tech lands on — without this a combobox in a labelled field
    still announced as unnamed.

- fb43898: Three catalogue gaps found by the Connect product-contract migration and the WorkerProfile adoption

  **`ProductPackageDetail`** — a route-injectable product package surface
  ([#206](https://github.com/wakecap/Wakecore/issues/206)). Identity, version, dependencies, outputs,
  permission gates, evidence and install state, over a governed install: a plan, a confirmation, and a
  receipt carrying package, version, project and actor. It owns no shell and no router, so it mounts
  inside a workspace route that already has a sidebar and a top bar. Authorisation is the host's
  answer, not the widget's — `canInstall` and `denialReason` disable the install action and nothing
  else, because a viewer still has to be able to read the package. Replaces the Card + Dialog + Badge +
  Button composition the Connect prototype kept in application state.

  **`NodeGraph`** — a domain-neutral functional node graph
  ([#204](https://github.com/wakecap/Wakecore/issues/204)). Typed nodes and edges with semantic tone,
  the ZoomTools row (zoom in/out, an editable percentage, fit and reset), selection by click or
  keyboard, node movement, optional edge creation, empty/loading/error states, and an inspector
  handoff. Four Connect journeys — pipeline, process, analysis readiness, lineage — had each rebuilt
  this on a raw engine; the engine now stays behind the widget, so a consumer describes nodes rather
  than adopting `@xyflow/react`. `GraphCanvas` gains a `showControls` prop and re-exports
  `ReactFlowProvider`, `useViewport` and the `NodeChange` / `EdgeChange` / `Viewport` / `XYPosition`
  types.

  **`WorkerProfile` per-tab loading and error state**
  ([#267](https://github.com/wakecap/Wakecore/issues/267)). The typed tabs rendered data-or-empty only,
  so a tab-gated fetch in flight and a failed one both read as "No certificates found." The new
  optional `tabStates` gives any tab a `{status: "loading"}` skeleton or a `{status: "error", message?,
onRetry?}` state that takes precedence over the empty text. Omit it and behaviour is unchanged.

- fb43898: feat(ui): add a FileSystem widget, and a file system to WakeCap Connect V3

  `FileSystem` is a new widget: a file system over records that live somewhere else. Nodes are a flat
  array with `parentId`, each file carrying an opaque `ref` the host reads back, and file types — their
  labels, marks, tints and owning apps — are declared by the host, so the widget knows no product's
  vocabulary and holds none of its data. Exported from `@wakecap/core-ui/file-system`.

  `CoreWC3Workspace` gains `showFiles`, which the V3 template turns on. It adds a Files entry at the
  head of the rail — pinned under the nav search and ruled off from Home and the app stages — and a
  surface listing the projects and every record in the selected organization, each file showing the
  folder it is filed in, narrowed by type / project / tag facets down the left.

  Each file type carries a soft tint — blue pipelines, violet processes, emerald object types, amber
  action types, rose products, teal datasets — on the icon in the listing, in the details panel and on
  the Types facet, so a kind is legible before its name is read. The tint uses the library's existing
  soft formula (a 10% fill with a colour that darkens in light mode and lightens in dark), the same one
  Badge's `*Soft` variants use.

  A "New" menu adds to the file system: a project from the All files page, a file of any type from
  inside a project, each through a small dialog that names the thing and — for a file — picks the folder
  it lands in. The node array is live for the session, so a created node appears in the listing, the
  facet counts and the project counts at once. Created files carry no record, so nothing offers to open
  them.

  Rows do not navigate. Clicking one selects it and a details panel opens on the right — type, location,
  project, tags, record id — so "what is this?" can be asked without losing your place. The underlined
  name is the only thing that leaves: a file's name opens the app that owns the record, a project's name
  swaps the layout for that project's own page, with Overview / Files / Trash down the left.

  It is a reference layer, not a second store. `wc3-fs-data.ts` holds folders plus pointers into the
  fixtures the other perspectives already render, so nothing is duplicated by switching it on. Opening
  a file navigates to the app that owns the record and drills straight to it; every listing in those
  apps gains a Location column naming the folder its records live in, which reopens Files narrowed to
  that folder.

  Also in this release:

  - `openWorkspaceTarget`'s `recordId` is now honoured. Views that own an addressable record accept
    `openRecordId` / `onOpenRecordConsumed`, so a cross-perspective jump can land on a record rather
    than on the tab that contains it.
  - `ScrollArea` gains `fitWidth`. Radix renders a viewport's child as `display: table`, which sizes it
    to its content — so on a fixed-width panel, padding meant to clear the overlay scrollbar ends up
    outside the visible box and the bar sits on the content. Opt-in, so a pane that scrolls
    horizontally on purpose is unaffected.
  - `DataTable` gains `getRowClassName`, for a table whose selection is the application's rather than
    the checkbox model's — marking the row a side panel is showing, without adopting row selection and
    its bulk-action bar.
  - `CoreAppSidebar` gains `pinnedTop`: one entry pinned directly under the search field, above Home,
    with a divider beneath it — for a surface that spans the apps in the rail rather than sitting among
    them. Like `showHome` and `showMarketplace`, an active `pinnedTop` suppresses every nav-row
    highlight, so the rail never marks two places at once. Opt-in; omit it and nothing changes.
  - `CoreAppTopBar`'s `projects` and `Switcher`'s `items` accept `readonly string[]`. Strictly
    widening — every existing caller still typechecks.
  - Fixed middle-truncated labels dropping a space at the truncation boundary: `TreeRowContent` and
    `CanvasFilePicker` rendered "Built assets" as "Builtassets".

- fb43898: `WorkerProfile` closes the four gaps that blocked adopting it as the product worker profile ([#257](https://github.com/wakecap/Wakecore/issues/257), [#258](https://github.com/wakecap/Wakecore/issues/258), [#259](https://github.com/wakecap/Wakecore/issues/259), [#262](https://github.com/wakecap/Wakecore/issues/262))

  The widget rendered the Certificates, Compliance and Device tabs itself, off fixed-shape data, with
  no slot a consumer could reach — so the product could not add a certificate, assign a device, show a
  certificate's type or document, bring its own compliance UI, or put the worker's photo and the
  worker-level menu anywhere. Every one of those forced the consumer back to hand-rolled chrome.

  - `certificatesActions` and `deviceActions` render caller content in those two tab headers, the way
    `crew` / `trainings` / `visits` already accept caller bodies.
  - `WorkerProfileCertificate` gains optional `type`, `issueDate`, and `document` (`{name, url?}`) —
    rendered as extra rows only when supplied.
  - `compliance` accepts a `ReactNode` as well as the typed model, for hosts that own their compliance
    UI and keep the compliance data layer in the app.
  - `identity` adds an optional region above the tabs: worker photo (falling back to initials, then a
    person icon), name, subtitle, and an `actions` slot for the worker-level "⋯" menu. No title bar.
  - `tab` + `onTabChange` make the tabs controllable; `defaultTab` still drives the uncontrolled case.

  Every addition is optional — callers on the current API render exactly as before.

- fb43898: `WorkerProfile`'s typed compliance checks report their decisions to the host ([#280](https://github.com/wakecap/Wakecore/issues/280))

  The typed `compliance` model rendered interactive controls — segmented status choices and an
  "Upload / replace document" button — that emitted nothing, so the model was display-only in practice and a
  host with editable compliance had to bypass the widget entirely and pass its own `ReactNode`.

  - **`onOptionChange`** reports the verdict the user picked. The widget holds no state: with a handler the
    choices are controlled by `selectedOption` and move only once the host writes the new option back.
    Re-pressing the active choice is swallowed rather than reported as a cleared answer — a verdict has no
    "neither" state.
  - **`onUploadDocument`** takes the upload intent. The widget owns no file input and runs no upload; the host
    opens its own picker and writes the result back through `document`.
  - **`loading`** locks one check while its write is in flight — the choices and the upload action disable and
    the upload action shows a spinner. Without it a controlled check looks dead between the click and the
    answer, and every further click is another call.
  - **`footer`** on the model renders under the checks, for a batched "Save compliance" bar. The per-check
    callbacks each report one decision; a host that commits them together had nowhere to put it. A model
    carrying a footer but no checks yet renders the footer instead of the empty text.

  Every addition is optional; callers on the current API render exactly as before — without a handler the
  choices still toggle locally and the upload action still renders, exactly as they do today.

- fb43898: `WorkerProfile` opens its built-in text and its certificate rows to the host ([#275](https://github.com/wakecap/Wakecore/issues/275), [#276](https://github.com/wakecap/Wakecore/issues/276), [#277](https://github.com/wakecap/Wakecore/issues/277))

  Three gaps left from the product adoption of the widget, all in what the host cannot reach.

  - **`text`** overrides the widget's own strings — per-tab name, empty text and error text, plus the
    `Retry` label and the loading announcement. `EMPTY_TEXT` and `ERROR_TEXT` were fixed English maps,
    so a portal that ships Arabic/RTL rendered its empty and error states in English whatever the
    locale; field labels and values were already the caller's. Anything left out of `text` keeps
    today's default, and a `tabStates` error `message` still wins over `text` for that one tab.
  - **`onCertificateDocumentClick`** takes the click on a certificate's document instead of navigating
    to its `url`. The product fetches certificate files with its own auth, and a bare `href` cannot
    carry that — the link opened to a 401. With a handler the document renders as a button and the
    host runs its own fetch-and-download; the handler wins over `url`, so a record with no publicly
    fetchable URL works too. Omit it and the document stays a plain link.
  - **`actions` on `WorkerProfileCertificate`** renders per-record controls (edit, delete, a "⋯" menu)
    at the top right of that certificate's block. `certificatesActions` is a single tab-header slot —
    right for "Add certificate", no help for a control that acts on one record.

  Every addition is optional; callers on the current API render exactly as before.

- fb43898: `WorkerProfile` takes a `tabs` allow-list, so a host can drop tabs it will never populate ([#273](https://github.com/wakecap/Wakecore/issues/273))

  The widget always rendered all seven triggers. Omitting `visits` did not hide the Visits tab; it
  showed the tab with "No visit records." forever. For a product with no Visits concept that reads as
  broken rather than as a state, and the only workaround was a local CSS rule hiding the trigger.

  `tabs?: WorkerProfileTabId[]` names the tabs this host has at all — only those triggers and panels
  render, in the widget's own canonical order. Omit it (or pass an empty array) and all seven render as
  before. `defaultTab` and a controlled `tab` are validated against the visible set and fall back to the
  first visible tab, so a disagreement between them cannot leave the widget with no panel.

### Patch Changes

- fb43898: Form builder refinements: the question inspector now exposes editable **Label** and **Description** fields (previously these were only editable on the canvas, so the label read as static text in the settings panel); the canvas now shows every question in the active section stacked together, with the selected card outlined by a darkened stroke (click a card to select it) rather than just the selected one; the preview now renders each section's name as a heading above its questions; the builder-only embed (e.g. the Work Permit template) now opens on the build-method chooser — the three starting cards — instead of dropping straight into a pre-filled form; questions and sections both reorder by dragging a 6-dot grip handle (revealed on hover) rather than up/down arrow buttons, a dragged question inserts at the drop position (no swapping) and can move into a different section (including empty ones), each section ends with a dotted "+" affordance that both adds a question and accepts a drop, and hovering a section header reveals a "+" too. When a `formSlot` is supplied, the StateMachine's Form section runs full-bleed (like the canvas) so the embedded builder fills the whole area.
- fb43898: Public JSDoc no longer tells consumers to write `wwc:` classes ([#268](https://github.com/wakecap/Wakecore/issues/268))

  Eight examples recommended a `wwc:`-prefixed utility, and one of them — `sheet.tsx`'s
  `className="wwc:top-14"` for the scrim — was in neither shipped stylesheet, so following it produced
  no styling at all and no error. The advice is subtly self-defeating: `cn()` is
  `extendTailwindMerge({prefix: "wwc"})`, so a prefixed class from a consumer _is_ recognised and _does_
  replace the component's own, which is exactly why it looks like a good trick — but whether it then
  paints depends on whether the library happened to compile that utility, which is a build artifact, not
  API. `wwc:bg-green-500` works; `wwc:bg-lime-400` renders nothing.

  The policy, now stated in `CLAUDE.md`: consumer-facing examples name plain unprefixed classes from the
  consumer's own CSS, or an inline `style` where a library utility would conflict — the scrim is
  documented as `overlayProps={{style: {top: 56}}}`, which beats its `inset-0`. `pnpm
validate:doc-classes` enforces it in CI.

- fb43898: Menu items get a highlight you can actually see, and a pointer cursor ([#279](https://github.com/wakecap/Wakecore/issues/279))

  Hovering a menu item gave no feedback at all. Radix focuses an item on pointer-over, so `focus:bg-accent`
  was the highlight — but light `--accent` is `oklch(0.975 0 0)` against a white `--popover`, a 0.025 L step
  that measures 1.07:1 and reads as nothing. The items also carried `cursor-default`, so there was no pointer
  either. Menu rows looked inert.

  - **`@wakecap/core-tokens`** adds `--menu-highlight` / `--menu-highlight-foreground` — `oklch(0.94 0 0)` in
    light, `oklch(0.28 0.007 70)` in dark. `--accent` could not simply be darkened: it is also the
    selected-state fill for Calendar's day and Toggle's on-state, so a value dark enough for a menu row
    repaints those. No existing token changes value, so nothing else in the system moves a pixel. Dark mode
    was already at the edge of perceptible and its step widens slightly.
  - **`@wakecap/core-ui`** repoints DropdownMenu, ContextMenu, Menubar, Select, Command and
    NavigationMenu at the new token and swaps `cursor-default` for `cursor-pointer`, covering submenu
    triggers, checkbox and radio items, and the hand-rolled SearchableSelect / MultiSelect option rows.
    The menubar and submenu triggers carry no `data-[disabled]` rule of their own, so they take an
    explicit guard — a disabled trigger keeps the default cursor rather than advertising itself as
    clickable. NavigationMenu's `data-[active]`/`data-[state=open]` fills stay on `--accent`: those are
    selected states, which is the role the token split leaves with `--accent`.

  Purely visual; no API change and no consumer action required. `scripts/validators/theme-contrast.test.mjs`
  now gates the token's contrast against every surface a menu opens over, in both themes — packages/tokens
  previously had no test, lint or typecheck target at all, which is why this shipped unnoticed.

- Updated dependencies [fb43898]
  - @wakecap/core-tokens@0.8.0

## 0.16.0

### Minor Changes

- cba8286: Three catalogue gaps found by the Connect product-contract migration and the WorkerProfile adoption

  **`ProductPackageDetail`** — a route-injectable product package surface
  ([#206](https://github.com/wakecap/Wakecore/issues/206)). Identity, version, dependencies, outputs,
  permission gates, evidence and install state, over a governed install: a plan, a confirmation, and a
  receipt carrying package, version, project and actor. It owns no shell and no router, so it mounts
  inside a workspace route that already has a sidebar and a top bar. Authorisation is the host's
  answer, not the widget's — `canInstall` and `denialReason` disable the install action and nothing
  else, because a viewer still has to be able to read the package. Replaces the Card + Dialog + Badge +
  Button composition the Connect prototype kept in application state.

  **`NodeGraph`** — a domain-neutral functional node graph
  ([#204](https://github.com/wakecap/Wakecore/issues/204)). Typed nodes and edges with semantic tone,
  the ZoomTools row (zoom in/out, an editable percentage, fit and reset), selection by click or
  keyboard, node movement, optional edge creation, empty/loading/error states, and an inspector
  handoff. Four Connect journeys — pipeline, process, analysis readiness, lineage — had each rebuilt
  this on a raw engine; the engine now stays behind the widget, so a consumer describes nodes rather
  than adopting `@xyflow/react`. `GraphCanvas` gains a `showControls` prop and re-exports
  `ReactFlowProvider`, `useViewport` and the `NodeChange` / `EdgeChange` / `Viewport` / `XYPosition`
  types.

  **`WorkerProfile` per-tab loading and error state**
  ([#267](https://github.com/wakecap/Wakecore/issues/267)). The typed tabs rendered data-or-empty only,
  so a tab-gated fetch in flight and a failed one both read as "No certificates found." The new
  optional `tabStates` gives any tab a `{status: "loading"}` skeleton or a `{status: "error", message?,
onRetry?}` state that takes precedence over the empty text. Omit it and behaviour is unchanged.

- cba8286: `WorkerProfile` closes the four gaps that blocked adopting it as the product worker profile ([#257](https://github.com/wakecap/Wakecore/issues/257), [#258](https://github.com/wakecap/Wakecore/issues/258), [#259](https://github.com/wakecap/Wakecore/issues/259), [#262](https://github.com/wakecap/Wakecore/issues/262))

  The widget rendered the Certificates, Compliance and Device tabs itself, off fixed-shape data, with
  no slot a consumer could reach — so the product could not add a certificate, assign a device, show a
  certificate's type or document, bring its own compliance UI, or put the worker's photo and the
  worker-level menu anywhere. Every one of those forced the consumer back to hand-rolled chrome.

  - `certificatesActions` and `deviceActions` render caller content in those two tab headers, the way
    `crew` / `trainings` / `visits` already accept caller bodies.
  - `WorkerProfileCertificate` gains optional `type`, `issueDate`, and `document` (`{name, url?}`) —
    rendered as extra rows only when supplied.
  - `compliance` accepts a `ReactNode` as well as the typed model, for hosts that own their compliance
    UI and keep the compliance data layer in the app.
  - `identity` adds an optional region above the tabs: worker photo (falling back to initials, then a
    person icon), name, subtitle, and an `actions` slot for the worker-level "⋯" menu. No title bar.
  - `tab` + `onTabChange` make the tabs controllable; `defaultTab` still drives the uncontrolled case.

  Every addition is optional — callers on the current API render exactly as before.

## 0.15.0

### Minor Changes

- 7e9e491: `StateMachine` takes its domain through props ([#251](https://github.com/wakecap/Wakecore/issues/251))

  The widget was parameterised on presentation and hardcoded on domain: seven props for how it looks,
  none for what it shows. Every vocabulary came from a demo fixture compiled into the package, so a
  product with its own action types could not bind a transition — its ids came back "not in the
  ontology" while rule L7 refused to publish unbound — and a product with its own rows saw an empty
  Instances section, an empty Bottlenecks section and a `0` on every node.

  ```tsx
  <StateMachine
    sections={[
      { items: ["canvas"] },
      { items: ["instances", "general"], divider: true },
    ]}
    sectionLabels={{ general: "NCR settings", instances: "Non-conformances" }}
    actions={[
      { id: "ncr.raise", label: "Raise NCR" },
      { id: "ncr.close", label: "Close NCR" },
    ]}
    instances={rows}
    readOnly={!canEdit}
    process={process}
    onChange={setProcess}
  />
  ```

  **New props**, all defaulting to empty rather than to the fixture: `actions`, `effects`,
  `instances`, `instancesLoading`, `sections`, `sectionLabels`, `readOnly`. `stateFlags` defaults to
  the built-in five instead, because `Wc3ProcessState.flags` is a closed union in the model — those are
  labels for something the widget already understands, not a vocabulary only the host can know.

  **Empty means undeclared, not none.** With no `actions`, the binding picker offers nothing,
  `checkTransition` accepts any id, and L7 does not fire — "this edge is not bound" says nothing when
  the host never said what binding means. Supply a vocabulary and both come back.

  **`variant` is now a preset.** It resolves to `sections` / `sectionLabels`, which are exported types
  you can pass yourself. A third product declares its own rail instead of adding a key to an enum
  inside core-ui.

  **`readOnly`** turns off node drag, the connection gesture, both add forms, every delete and Tidy
  layout. The closest thing before was `shell={false}`, which stripped the header and rail and still
  committed a `moveState` on every nudge.

  **Smaller bundles.** The demo vocabularies moved to `@wakecap/core-ui/pages/state-machine-fixtures`,
  which only stories and demo surfaces import. Measured with esbuild, the fixture payload a consumer
  pulls drops from **23.4 KB gz to 11.6 KB gz**. The remainder is `WC3_OBJECT_TYPES`, still reached
  through `getObjectType` for the backing-type glyph.

  ### Breaking

  Pure helpers take their data as an argument instead of closing over a fixture:

  | before                                | after                                                         |
  | ------------------------------------- | ------------------------------------------------------------- |
  | `processInstances(proc)`              | removed — pass rows, or `demoInstances(proc)` for the fixture |
  | `processTokens(proc, stateId)`        | `processTokens(proc, stateId, rows)`                          |
  | `processOpenRows(proc)`               | `processOpenRows(proc, rows)`                                 |
  | `processBottlenecks(proc)`            | `processBottlenecks(proc, rows)`                              |
  | `processAgingBuckets(proc, stateId?)` | `processAgingBuckets(proc, rows, stateId?)`                   |
  | `processFacts(p)`                     | `processFacts(p, rows?, actions?)`                            |
  | `transitionAction(t)`                 | `transitionAction(t, actions)`                                |
  | `processGraphLint(p)`                 | `processGraphLint(p, actions)`                                |
  | `checkTransition(p, from, to, id)`    | `checkTransition(p, from, to, id, actions?)`                  |
  | `stateDeleteBlockReason(p, stateId)`  | `stateDeleteBlockReason(p, stateId, rows?)`                   |
  | `permitTypeOptions(process)`          | `permitTypeOptions(process, rows?)`                           |

  `ProcessBottlenecksSection` gains an `instances` prop; `WC3_PROCESS_EFFECTS` moved to the fixtures
  entry as `DEMO_EFFECTS`.

## 0.14.0

### Minor Changes

- 5d9f2bf: Add a 3D Viewer variant to the Building Viewer template: `core-building-viewer` (Main Views — 3D `FragmentViewer` with the shared BuildingProgress + WeekSelector chrome, the 3D sibling of the Blueprint Viewer) and a beta `core-building-viewer-capture` (Capture UI — the same model with the Capture app's villa-level floating panels: floor list, minimap, inspector).
- 5d9f2bf: Add `CameraDetailPanel` — the floating detail for one camera: its fields, then the violations it caught as a selectable list. Picking a row drills into that ticket.

  Both detail panels now share `DetailPanelShell`, which owns the fixed width, the header (optional back control, title, meta, close) and the internally scrolling body — so a drill-in swaps the body without the frame moving. `ObservationDetailPanel` gains `onBack` / `backLabel` for the return trip.

  The panel leads with a 16:9 preview frame: `thumbnailUrl` renders a still, `live` badges it, and `preview` replaces the contents outright — the slot a live player drops into later, since the frame, rounding and clipping stay with the panel. With neither, it shows a "No preview" placeholder.

  `DetailPanelShell` takes a `maxHeight` (default `60vh`) and caps the card itself rather than filling its container, so a floating detail panel and a `MapControlPanel` share the same width and height ceiling.

  `DetailPanelShell` closes on Escape whenever `onClose` is given, so both detail panels dismiss with the keyboard. A dropdown or popover open over the panel owns Escape first — the first press closes it, a second closes the panel.

- 5d9f2bf: `Dialog` gains a `stacked` variant, restoring the pre-0.3 header as a choice ([#248](https://github.com/wakecap/Wakecore/issues/248))

  The header went from stacked in 0.2 to a banded 40px `bg-muted` strip in 0.13 with no opt-out, and a
  consumer's only route back was overriding core-ui's shipped classes — which is how per-app drift
  starts.

  ```tsx
  <DialogContent variant="stacked">
    <DialogHeader>
      <DialogTitle>Add certificate</DialogTitle>
      <DialogDescription>
        Record the certificate name, type, dates and supporting document.
      </DialogDescription>
    </DialogHeader>
    …
  </DialogContent>
  ```

  It is ONE prop, not three: the header, the footer, the close button and the body padding all read it
  from context, so they cannot drift apart. `DialogHeader` and `DialogFooter` each take their own
  `variant` to override it for the odd case, and `closeAlign` now defaults to whatever the variant
  implies instead of always `"band"`.

  **`banded` stays the default.** The band is a system decision rather than a dialog one — it is
  deliberately the same strip `WidgetCardHeader` and `TableHeader` draw — so reverting the dialog alone
  would leave it as the only unbanded header in the library. Flipping the default is one line in
  `dialog.tsx` if the design call goes the other way.

- 5d9f2bf: Add `FLOAT_SHADOW` — the shared shadow for surfaces that float over content, deliberately shallow (`0 4px 12px rgba(0,0,0,0.06)`) so a floating panel reads as lifted a millimetre off the map rather than hovering above it.

  `MapControlPanel`, `MapLegend`, `DetailPanelShell`, `TimeScrubber` and the map's reset control move from `shadow-lg` to it, and `BlueprintSegment`'s local copy of the same value now imports it — so every floating surface in the library agrees on one shadow.

- 5d9f2bf: Ship the animation utilities the components already name. `src/styles.css` loaded no animation plugin, so every `animate-in` / `animate-out` / `slide-*` / `fade-*` / `zoom-*` class the library writes compiled to nothing — Sheet, Dialog, AlertDialog and Popover all appeared instantly rather than animating. Importing `tw-animate-css` (the Tailwind 4 successor to `tailwindcss-animate`, where those class names originate) emits them with the `wwc:` prefix intact. Both stylesheets grow ~8.5 KB uncompressed: `styles.css` 172.7 → 181.2 KB, `styles.tw4.css` 169.6 → 178.2 KB. Fixes #239.

  Move `react-hook-form` from `dependencies` to an optional `peerDependencies` entry (`>=7.46`). `Form` and `FormField` read the consumer's form state through React context, so they have to bind to the consumer's copy of the library — as a plain dependency a consumer on a different minor got a second instance, two contexts, and a `FormField` that silently never saw the form its host created. It is optional, so a consumer who never touches `Form` installs nothing. Fixes #241.

  `ConfirmDialog` forwards its remaining props to the underlying `AlertDialogContent`. A confirm driven from state has no `AlertDialog.Trigger` for Radix to restore focus to, so focus fell to `document.body` on close and the next Tab restarted from the top of the surrounding panel; `onCloseAutoFocus` (and every other content prop) now has a route through. Also exports `confirmDestructiveClassName`, so a surface that must compose `AlertDialog` directly gets the same red rather than copying the value. Fixes #238.

  `Combobox` and `SearchableSelect` accept a server-backed data source. `onSearch` — debounced, 300 ms by default — turns client-side filtering off so the server's result set is displayed as given; `loading` renders a spinner and gates paging; `onLoadMore` fires once when the list is scrolled near its end, and `hasMore` stops it when the server runs out. `selectedOption` labels a selection the current page no longer holds. `shouldFilter` overrides the mode either way, and a static `options` array behaves exactly as before. Fixes #237.

  `ComboboxOption` and `SearchableSelectOption` carry an optional `data` payload, handed back as the second argument to `onValueChange` — a caller binding a whole record (`{id, name}`) into a form gets it back without re-deriving it from the value.

  `SheetContent` stops hardcoding its own composition: `portalProps` retargets where the sheet mounts, `overlayProps` restyles the scrim (a scrim that starts below an app topbar rather than at `inset-0`), `overlay` replaces it or removes it with `null`, and `showCloseButton={false}` suppresses the close button for a panel whose own header already carries one. `sheetVariants` and the `SheetContentProps` type are exported, so the skin can be taken without the composition.

  Add `useDebouncedValue` — the small hook behind the searchable controls' debounced term, exported at `@wakecap/core-ui/use-debounced-value`.

- 5d9f2bf: Add `MapControlPanel` — a collapsible floating control card for map surfaces. Declarative `selects` (single-choice `Select`, or the searchable `MultiSelect` with its removable pills) over `toggles`, on the standard card surface so it stays legible over imagery. It owns no map state; every row is controlled.

  `ObservationsMap` gains a `controls` slot that pins it to the top-left corner, mirroring how `timeline` pins the `TimeScrubber` to the bottom.

  `MultiSelect` (`@wakecap/core-ui/multi-select`) now accepts an `id`, forwarded to its trigger, so a `<Label htmlFor>` can address the field.

  Add `onClear`, which renders a Clear control in the header for resetting every filter at once, plus `width` (default `340`) and `maxHeight` (default `60vh`). The card caps its own height and the body scrolls beneath it, so a panel carrying several filters and their pills cannot outgrow the map it floats over — and the defaults match the floating detail panels, so the two agree on width and height.

  Rows accept `as: "chips"`, rendering their options as toggle `Chip`s instead of a dropdown — right for a handful of options, where a dropdown hides every choice behind a click. Options can carry a `color`, drawn as a swatch on the chip so a filter can be read against a legend.

  Rows accept `separatorBefore`, drawing a divider above the row — enough to split a panel into groups (filters above, display controls below) without a second list.

  The header collapse control uses the pane icons (`PanelLeftClose` / `PanelLeft`), matching the pane toggle in the AI chat header, instead of a rotating chevron. Its label reads Hide / Show map controls.

  `MultiSelect` (`@wakecap/core-ui/multi-select`) gains `maxPills` (default `4`). Beyond the cap the remaining selections collapse into a `+N` chip that opens them in a popover, each still removable — so a long selection no longer grows the field's height without bound. Pass `0` to keep the old always-show-everything behaviour. Every panel dropdown inherits it.

  Add `collapsedWidth` (default `160`). A collapsed panel carries only its title and toggle, so it narrows as well as shortens, with the width animating.

  Chip rows accept `chipColumns`, wrapping their options into an even grid instead of one row — a five-option row does not fit a panel at any label length.

  Add `fadeEdges`, which fades the whole card out at its top and bottom edges — surface, border and all — so a panel dissolves into what is behind it instead of ending on a hard rectangle.

- 5d9f2bf: Add `MapHoverCard` — the card shown while hovering a map marker: an optional media strip, a title, badges, a few label/value rows and a closing line. Sized to be read without moving the eye far, and carrying only what identifies the thing rather than duplicating its detail panel.

  `ObservationsMap` gains `renderHoverCard`. Markers are plain DOM outside React, so the widget tracks what is under the cursor and places the card above it; the caller supplies only the content, and can say something different for an observation, a camera and a responder.

- 5d9f2bf: Add `MapLegend` — a compact, foldable key for what is drawn on a map. Swatches take the shape of the thing they describe (circle, square, fill, line, dashed) and can carry the same glyph the marker uses, so the key and the map cannot disagree. Sections are declarative, and the card matches the other floating map panels.

  `ObservationsMap` gains a `legend` slot above the timeline, and exports its marker glyphs (`HAZARD_ICON`, `CAMERA_ICON`, `RESPONDER_ICON`) so a legend can reuse them rather than redraw them.

  The legend slot sits bottom-right, and `legendInline` drops it onto the timeline's own row — a collapsed `TimeScrubber` narrows to three-quarter width, which leaves exactly that space.

- 5d9f2bf: Add `ObservationDetailPanel` — the floating detail for one observation ticket: the record's fields, its lifecycle actions, and the `CommentThread` that doubles as its audit trail, with a `CommentComposer` for new comments. Fixed width with an internally scrolling body, so it can float over a map without outgrowing it.

  The record shape mirrors the Safety Manager list view (status, severity, source, category, company, zone, assignment, group count, false-positive), so the same violation reads identically opened from the map or the list. Lifecycle rules stay with the caller — pass whichever actions apply to the ticket's status and source.

  `ObservationsMap` gains a `detail` slot that pins it to the top-right corner.

  The comment composer is pinned to the foot of the panel rather than sitting inside the scrolling body, so it stays reachable however long the thread gets. `comments` render in the order given and read oldest-first — append new entries and they land directly above the composer, with the foot of the thread scrolled into view.

  `DetailPanelShell` gains a `footer` slot for that pinned region.

- 5d9f2bf: Add `ObservationsMap` — a Mapbox widget that drapes a georeferenced blueprint over the basemap and pins observations on top of it.

  The blueprint is an image source anchored by its four corners (`[top-left, top-right, bottom-right, bottom-left]`), so the plan stays locked to the ground while panning and zooming. Until a `blueprintUrl` is supplied, the widget draws the footprint outline from the same corners, which keeps the georeferencing verifiable without an image.

  Pass `fullHeight` to fill a height-constrained parent (e.g. an `h-dvh` flex column) instead of the default 500px.

  Pass `timeline` (a `TimeScrubberProps` object) to float the existing `TimeScrubber` — the same timeline the Workforce Map View uses — along the bottom edge of the map. The widget owns only the placement; filtering `observations` by the cursor time stays with the caller.

  Pass `zones` to draw site zone polygons over the map — each in its own colour, labelled, and clickable via `onZoneSelect`. Rings are sanitised before drawing: consecutive duplicate points (the spaces API repeats the closing point, sometimes several times) are collapsed and the ring is closed explicitly. `fitTo="zones"` frames the zones rather than the blueprint, which matters when a site footprint dwarfs the zones inside it.

  Observation markers are rounded-square badges rather than teardrop pins — coloured fill, light border ring, soft shadow, and a white glyph centred on the coordinate. The glyph defaults to lucide's `triangle-alert` (the hazard mark for a safety violation) and is overridable via `observationIcon`; `observationMarkerSize` sets the badge size. Markers are built as plain DOM, not React roots, so a few hundred of them stay cheap.

  Pass `cameras` to pin cameras on the map. Each renders as a slate badge with lucide's `cctv` glyph and an always-on notification-style count of the violations attributed to it (`99+` above 99), matching how an alert icon carries its count. The count is neutral rather than alarm-coloured — it says how many, not how bad — and renders as a circle for a single digit, widening into a pill beyond that. `showCameras`, `onCameraSelect`, `cameraIcon` and `cameraMarkerSize` configure them.

  `controls` floats arbitrary content — typically a `MapControlPanel` — in the map's top-left corner, mirroring how `timeline` floats the `TimeScrubber` along the bottom.

  Fix zones, the blueprint and its footprint disappearing whenever the basemap style changed. The overlay rebuild runs on `style.load`, but guarded itself on `isStyleLoaded()` — which is still false at that point — so it bailed and never re-added the layers. It now reschedules on `idle` instead. Only the initial style, which loads via `load`, ever drew them.

  Add `focusedIds` and `dimOpacity`. Ids in `focusedIds` stay at full strength while everything else on the map — other markers, zones, the blueprint — fades back, so a selection reads against a quiet map. Pass a single observation, or a camera together with the violations it caught.

  Observation and camera markers no longer open a mapbox popup — the detail panel carries the record, and a bubble over the pin covered the markers the selection is meant to be read against. Added `onBackgroundClick`, which fires when the map itself is clicked rather than a marker, so a floating panel can close on click-outside.

  Add `zoneColorMode`. `payload` (the default) keeps each zone's own colour; `neutral` replaces them with a quiet grey ramp, so the only colour on the map that carries meaning is the observation status. A payload can hold 80-plus distinct colours across overlapping zones, which reads as noise rather than information.

  Add `bearing` and `pitch` for the opening camera, and `onViewChange`, which reports `center` / `zoom` / `bearing` / `pitch` as the camera moves — the values needed to capture a framing and set it as the default.

  Camera markers use a filled video-camera glyph on a muted slate-blue badge (`#3d4a5c`), replacing the photo-camera badge. Observation badges are circular and cameras stay rounded-square at the same 20px size, so shape rather than size distinguishes them. Desaturated on purpose — a camera is context, not a finding, so it stays legible without competing with the status-coloured violations.

  Add `selectedZoneIds` and `selectionPadding`. Selected zones get a marching-ants outline and the map flies to fit them, so a zone picked from a list lands framed in the viewport — one zone or several. Selecting a zone lifts it and fades every other zone back — fill, outline and label together — so the selection stands alone while the surrounding geometry stays faintly readable. Clearing the selection eases back to the view the map opened on.

  Add `showResetView`, `resetViewLabel` and `resetViewWidth`. A reset control appears alongside the `controls` slot once the camera has left the view it opened on and eases back to it, so panning around is always recoverable without hunting for the original framing. It stays hidden until the view has actually moved, past a small tolerance so a nudge does not summon it, and is sized (default 160) and styled to match a collapsed `MapControlPanel` so the floating controls read as one set of modules.

  Fix a marker click also selecting the zone underneath it. Markers sit inside mapbox's canvas container, so a marker click fires the zone layer's click handler too — opening a violation dragged its zone into the selection with it.

  Zones draw as fills only — the per-zone outline stroke is gone. The selection's marching-ants outline is unaffected, so an outline on the map now means "selected" rather than "is a zone".

  The story's timeline frames data every five minutes rather than hourly. Violations arrive in bursts and an hourly bar averages a spike flat; five minutes also matches how often a responder's position is sampled, so a bar and a whereabouts describe the same instant. Axis ticks stay hourly — 288 ticks would render as a solid line.

  "Now" — and the opening window — is the last five minutes rather than the hour so far, matching the timeline frame. Widening the range is still a drag away; the default just answers "what is happening now" instead of "what has happened this hour".

  Observations that arrive without coordinates cannot be pinned. The story keeps them out of the map and lists them in a panel under the filters — always present, reading "none in this window" when empty rather than vanishing, using the same `ViolationList` rows as every other route into a ticket — clicking one opens the same right-hand panel a marker would, with the zone reported as unknown rather than guessed. The timeline readout counts them alongside the pinned and camera-held ones, so the totals still reconcile.

  The `controls` corner is bounded above the timeline and scrolls, so a tall stack of panels runs out of room rather than sliding underneath it. The bound follows `legendInline`, reclaiming the space a collapsed timeline gives up.

  The story's control panels start folded and the unlocated list starts open — the inverse of before. Filters and Settings are an aside to a map that is the actual content, and both are one click away; the unlocated list is not, because nothing on the map stands in for it. It also drops its border and keeps the edge fade, so it reads as a list lying on the map rather than a second control panel.

- 5d9f2bf: feat(ui): add the Work Permit template

  `WorkPermit`, exported from `@wakecap/core-ui/pages/core-work-permit`: the
  permit-management scaffold. Same shell as `CoreWorkforce` — CoreAppSidebar +
  CoreAppTopBar with a single "Work Permits" entry — and a route header carrying six tabs:
  Dashboard, Work Permits, Templates, Map, AI Agent (badged `SOON`) and Settings.

  Every tab body is a placeholder naming what belongs in it. The shell, the nav and the tab
  set are the decisions this template makes; the surfaces fill in later.

  Two deliberate divergences from Workforce: Settings is a peer tab rather than the icon
  action beside the tabs, and AI Agent carries a badge instead of being disabled — the tab
  opens and says what is coming rather than refusing to respond.

- 5d9f2bf: Add `ResponderDetailPanel` — the floating profile for one safety responder: identity and trade, the sent / acknowledged / closed alert tally, acknowledgement rate and response times, the platform mix they acknowledge from, and the companies, zones, packages and observation sources they cover. The record mirrors the Safety Manager responder list, so a responder reads the same opened from the map or the list.

  `ObservationsMap` gains `responders`, `showResponders`, `onResponderSelect`, `responderIcon` and `responderMarkerSize`. Responders draw as square badges like cameras — both are site fixtures rather than findings — with a filled guard glyph and their own hue, and an off-shift responder draws at reduced strength rather than disappearing.

  Responders sharing a coordinate with a camera are nudged clear of it, so neither badge can bury the other. The test and the offset are in pixel space and re-run on zoom, rotate and pitch — badges are a fixed pixel size, so a geographic offset that separates them at site zoom leaves them overlapping when zoomed out.

  `ObservationsMap` gains `coverage` — a radius in metres drawn around a point, for the ground a selected responder covers. The circle is a polygon in geographic space, so it stays true on the ground as the map zooms, and its longitude radius is divided by cos(latitude) so it reads as a circle rather than an ellipse away from the equator.

  The panel lists the violations assigned to the responder and, separately, those inside their coverage radius that are not theirs — the ones they are close enough to pick up — each row showing how far away it is and drilling into the full ticket with a way back.

  Both lists, and the camera panel's, render through a new shared `ViolationList` so the rows cannot drift apart between panels.

  Responders move, so a range selection cannot be answered with one point. `ObservationsMap` gains `track` — the responder's path through the selected window as one segment per unbroken run of contact, drawn as a dashed line inside a corridor of `radiusMeters`. Contact drops, and joining the point before a gap to the point after would draw a walk that may never have happened and claim coverage over ground nobody was on, so a gap is drawn as a gap. The corridor is the path stroked at twice the radius with round caps and joins, which is exactly the ground within that radius of the path, with no buffer geometry; its width is recomputed from metres on every zoom so the ground it covers stays constant.

  The panel's "In range" list is now judged per violation, at the moment each was reported, against where the responder actually stood then — over a range, a single circle both misses violations they could have reached and claims ones they could not.

  A run where the responder never moved is drawn as a disc rather than a corridor, outlined only when no corridor accompanies it — beside a band, a dashed circle reads as a separate object rather than the same coverage — a line has nothing to stroke, and mapbox drops one shorter than about a metre as too small to tile. A focused responder is also exempt from the camera de-collision nudge, so its coverage centres on the badge rather than on the camera it was moved away from.

- 5d9f2bf: Add `ObservationsMapView` (`@wakecap/core-ui/pages/core-observations-map-view`) — the Observations Map as a whole working view: a day of observations over the RNGLF site with the cameras that caught them and the responders who work them, a five-minute timeline, filter and display panels, an unlocated queue, a key, and the ticket / camera / responder panels a marker opens. Everything it draws is generated inside it, so it runs with no data wiring, and it fills whatever height its parent gives it.

  Safety Manager's Map View renders that view, replacing the placeholder basemap centred on Riyadh, which showed nothing at all.

  The view was the `ObservationsMap` story's own scene. Moving it into the package means the story and the template show the same map rather than two copies of one demo — the story now renders `ObservationsMapView` inside a full-height wrapper and keeps only its docs.

  The RNGLF zone fixture moved into the package too, as `@wakecap/core-ui/data/rnglf-zones`, since the view needs it from inside the package.

  Remove a duplicate `MapZone` interface declaration in `observations-map` — identical, so it merged rather than erroring, but only one is the definition.

- 5d9f2bf: `ProcessBuilder` is now `StateMachine`, one widget with a variant per product cut

  The state-machine authoring surface — header band, left section rail, canvas, editing panel,
  validity footer — is a single widget that both products mount, rather than a "process builder" one
  product had and another borrowed. What it authors is a state machine whatever the record is called.

  - `@wakecap/core-ui/pages/process-builder` → `@wakecap/core-ui/pages/state-machine`
  - `ProcessBuilder` → `StateMachine`; `ProcessBuilderVariant` / `ProcessBuilderSection` /
    `ProcessBuilderProps` → `StateMachineVariant` / `StateMachineSection` / `StateMachineProps`
  - `variant="full"` → `variant="connect"` (WakeCap Connect V3's process page, what `ProcessDetail`
    mounts). `variant="work-permit"` is unchanged. The variant axis is now the PRODUCT CUT, and today
    the two cuts differ in the left rail alone — sections, order, labels, and whether General carries
    the permit fields. That is a traits table, not a branch, so a canvas that needs to diverge later
    becomes a new trait row.
  - `variant="canvas"` → `shell={false}`. The bare graph is not a product cut, so it is not a variant.
    It still turns the editing rail off with the shell, for the same reason it always did: a dragged
    edge takes its action binding in the rail.

  `authoring` now opens the rail on the **Canvas** whatever the variant leads with, and it is wired
  through both products: `ProcessDetail` takes `isNew`, and the Processes list tracks the id it just
  created in session state. Crossed with `variant` that gives the four real surfaces — new process /
  existing process (Connect V3), new template / existing template (Work Permit) — as two axes rather
  than four variants, so a canvas fix is made once.

  A NEW record opens on a **worked example**, never a blank canvas. `createProcess()` seeds
  Draft → In review → Active → Closed with a Rejected branch that reopens — structurally complete
  against L1–L6, with every edge unbound and dashed, because a generic process cannot know which of
  your action types fires "submit"; binding them is the one thing left and L7 lists them. The Work
  Permit register's `defaultTemplateGraph()` is now exported, and its new templates open on the
  standard permit lifecycle already bound and publishable. The old two-state stub failed L3, L4 and L5
  on sight and made every author invent a lifecycle from nothing.

  `PageContentHeader`'s title now steps down as the header narrows (24 → 20 → 18px for
  `title-actions`, 16 → 14px for `comfortable`), measured off the header's own `@container`. Its size
  and weight are `!important`: it is a semantic heading, our utilities live in `@layer utilities`, and
  any unlayered `h1 {}` rule in a host app beats a layered one however specific — and `styles.tw4.css`
  ships no reset by design, so preflight cannot be relied on either.

  `GraphCanvas` is now the one door to `@xyflow/react`: alongside the component it re-exports
  `Handle`, `Position`, `MarkerType`, `Panel`, `useNodesState`, `useEdgesState`, `useReactFlow` and the
  `Node` / `Edge` / `NodeProps` / `EdgeProps` / `Connection` / `FinalConnectionState` types, and loads
  React Flow's stylesheet once. `StateMachine` names no third-party package as a result. Nothing is
  renamed or wrapped and nothing renders differently — what changes is that one module owns the
  dependency, its version and its context.

  A selected node now carries a 2px primary ring and a soft lift, set as React Flow's own
  `--xy-node-boxshadow-selected` (its default is 0.5px of near-black, invisible on a tinted node).
  Scoped by React Flow to built-in node types, so canvases with fully custom nodes are untouched.

  `DataTable` styles the `actions` column itself — `w-px max-w-none overflow-visible text-clip
whitespace-nowrap` — so a squeezed action column can never draw a stray "…" behind a half-clipped
  button, and keeps its content width while the text columns absorb the squeeze. Naming the column
  `actions` is enough; `meta.cellClassName` is now only for other control columns.

  `SectionHeader` and `Typography`'s H1–H4 pin their size and weight the same way `PageContentHeader`
  does, for the same reason: they render semantic headings, and any unlayered `h1 {}` / `h2 {}` rule
  in a host app beats a layered utility however specific.

  Also in this release, on the same surface:

  - The canvas is on React Flow's own defaults — built-in default node, default `#b1b1b7` bezier
    edges, default handles and selection, and the `#f7f9fb` / `#101012` ground from reactflow.dev's
    example theme. Each node carries its state's identity colour at 14%, the same colour the rail
    prints beside it. Edges carry no labels.
  - A legal connection drag now COMMITS on drop, unbound and dashed, and opens its inspector on the
    binding. `Wc3ProcessTransition.actionTypeId` is nullable for this; the rule that a graph cannot
    publish unbound moved from `checkTransition` to lint rule L7.
  - The canvas is full-bleed between the section rail and the editing panel, which is now a panel
    mirroring the shell's left one. The validity footer is centred, and shimmers while it rechecks
    (`--animate-text-shimmer`, new in `@wakecap/core-tokens`).
  - `GraphCanvas` follows the host's `dark` class through React Flow's `colorMode`.

- 5d9f2bf: Add `size` to `Switch` — `sm` (16×28 track, 12px thumb) alongside the existing default (20×36, 16px thumb), for dense surfaces like floating panels and toolbars. The thumb's travel is derived from the size, so it can't be produced by a class override on the root alone. Existing usage is unchanged.

  `MapControlPanel` toggles now use it.

- 5d9f2bf: feat(ui): promote the process builder out of the Connect V3 template into a widget

  The state-machine editor lived inside the Connect V3 process page and could not be
  mounted anywhere else. It is now `ProcessBuilder`, exported from
  `@wakecap/core-ui/pages/process-builder`, with a `variant` axis (`full` | `canvas` |
  `work-permit`) as the declared extension point. `ProcessDetail` mounts it in its
  `full` variant, so the page and the widget share one implementation and cannot drift.

  `work-permit` is the Digital Work Permit cut: the same shell as `full`, re-cut as
  General, Canvas, Form, then a rule, then Instances and Bottlenecks. General is the
  Settings section renamed, carrying the permit's type and description beside the record's
  own name and icon. `formSlot` fills the Form section.

  Section order, grouping, the rule between groups and the Settings/General rename are all
  rows in one `VARIANT_TRAITS` table rather than branches in the render. `ProcessDetail` is
  now a thin wrapper over `variant="full"` and renders exactly what it always did.

  `SideMenuGroup` gained an optional `divider`, which draws a rule above a group — without
  it two unlabelled groups are separated by 2px and read as one list.

- 5d9f2bf: Add an optional `legend` to `TimeScrubber` — a row of small swatches in the header for reading a stacked `segments` track. Each entry takes a `label` plus either a `color` or a `className` matching the segment it describes.

  Add `rangeValue` / `onRangeValueChange` — a second handle that turns the track into a window. Drag either end; the band between them is the selection, and the ends clamp against each other rather than crossing. The handle is chosen on pointer-down and held for the gesture, so dragging one end past the other doesn't hand the drag over. `value` still drives the playhead, so a range and a cursor coexist.

  `collapsed` / `onCollapsedChange` make the collapse state controllable, so a surrounding layout can react to it rather than guess.

### Patch Changes

- Updated dependencies [5d9f2bf]
  - @wakecap/core-tokens@0.7.1

## 0.13.1

### Patch Changes

- cf045ef: Drop `@hookform/resolvers` from `dependencies`. No shipped module imports it — the library's own code touches `react-hook-form` only, in `form.tsx` — but carrying it contradicted the peer range set in 0.13.0: pnpm resolves the declared `^5.2.2` to `5.9.1`, whose own peer is `react-hook-form@^7.55.0`, so a consumer anywhere in `7.46 … 7.54` (inside the range core-ui advertises as `>=7.46`) got an unmet-peer warning it could do nothing about.

  Reproduced against 0.13.0 with a consumer pinning `react-hook-form@7.46.1`:

  ```
  └─┬ @wakecap/core-ui 0.13.0
    └─┬ @hookform/resolvers 5.9.1
      └── ✕ unmet peer react-hook-form@^7.55.0: found 7.46.1
  ```

  The same install is clean now. A resolver is the consumer's choice, paired with the consumer's `react-hook-form`, exactly as that library is since 0.13.0 — so core-ui states one constraint (`react-hook-form >=7.46`) rather than two that disagree.

  The `core-ui-forms` skill gains an Install section spelling out the pairing: install `react-hook-form`, `@hookform/resolvers` and `zod` yourself, and on `7.46 … 7.54` take `@hookform/resolvers@^3`, whose peer range covers it.

  Note for anyone who was importing `@hookform/resolvers` without declaring it — that only ever worked by hoisting, and now needs a direct dependency.

## 0.13.0

### Minor Changes

- 3507bb3: Add a 3D Viewer variant to the Building Viewer template: `core-building-viewer` (Main Views — 3D `FragmentViewer` with the shared BuildingProgress + WeekSelector chrome, the 3D sibling of the Blueprint Viewer) and a beta `core-building-viewer-capture` (Capture UI — the same model with the Capture app's villa-level floating panels: floor list, minimap, inspector).
- 3507bb3: Add `CameraDetailPanel` — the floating detail for one camera: its fields, then the violations it caught as a selectable list. Picking a row drills into that ticket.

  Both detail panels now share `DetailPanelShell`, which owns the fixed width, the header (optional back control, title, meta, close) and the internally scrolling body — so a drill-in swaps the body without the frame moving. `ObservationDetailPanel` gains `onBack` / `backLabel` for the return trip.

  The panel leads with a 16:9 preview frame: `thumbnailUrl` renders a still, `live` badges it, and `preview` replaces the contents outright — the slot a live player drops into later, since the frame, rounding and clipping stay with the panel. With neither, it shows a "No preview" placeholder.

  `DetailPanelShell` takes a `maxHeight` (default `60vh`) and caps the card itself rather than filling its container, so a floating detail panel and a `MapControlPanel` share the same width and height ceiling.

  `DetailPanelShell` closes on Escape whenever `onClose` is given, so both detail panels dismiss with the keyboard. A dropdown or popover open over the panel owns Escape first — the first press closes it, a second closes the panel.

- 3507bb3: Add `FLOAT_SHADOW` — the shared shadow for surfaces that float over content, deliberately shallow (`0 4px 12px rgba(0,0,0,0.06)`) so a floating panel reads as lifted a millimetre off the map rather than hovering above it.

  `MapControlPanel`, `MapLegend`, `DetailPanelShell`, `TimeScrubber` and the map's reset control move from `shadow-lg` to it, and `BlueprintSegment`'s local copy of the same value now imports it — so every floating surface in the library agrees on one shadow.

- 3507bb3: Ship the animation utilities the components already name. `src/styles.css` loaded no animation plugin, so every `animate-in` / `animate-out` / `slide-*` / `fade-*` / `zoom-*` class the library writes compiled to nothing — Sheet, Dialog, AlertDialog and Popover all appeared instantly rather than animating. Importing `tw-animate-css` (the Tailwind 4 successor to `tailwindcss-animate`, where those class names originate) emits them with the `wwc:` prefix intact. Both stylesheets grow ~8.5 KB uncompressed: `styles.css` 172.7 → 181.2 KB, `styles.tw4.css` 169.6 → 178.2 KB. Fixes #239.

  Move `react-hook-form` from `dependencies` to an optional `peerDependencies` entry (`>=7.46`). `Form` and `FormField` read the consumer's form state through React context, so they have to bind to the consumer's copy of the library — as a plain dependency a consumer on a different minor got a second instance, two contexts, and a `FormField` that silently never saw the form its host created. It is optional, so a consumer who never touches `Form` installs nothing. Fixes #241.

  `ConfirmDialog` forwards its remaining props to the underlying `AlertDialogContent`. A confirm driven from state has no `AlertDialog.Trigger` for Radix to restore focus to, so focus fell to `document.body` on close and the next Tab restarted from the top of the surrounding panel; `onCloseAutoFocus` (and every other content prop) now has a route through. Also exports `confirmDestructiveClassName`, so a surface that must compose `AlertDialog` directly gets the same red rather than copying the value. Fixes #238.

  `Combobox` and `SearchableSelect` accept a server-backed data source. `onSearch` — debounced, 300 ms by default — turns client-side filtering off so the server's result set is displayed as given; `loading` renders a spinner and gates paging; `onLoadMore` fires once when the list is scrolled near its end, and `hasMore` stops it when the server runs out. `selectedOption` labels a selection the current page no longer holds. `shouldFilter` overrides the mode either way, and a static `options` array behaves exactly as before. Fixes #237.

  `ComboboxOption` and `SearchableSelectOption` carry an optional `data` payload, handed back as the second argument to `onValueChange` — a caller binding a whole record (`{id, name}`) into a form gets it back without re-deriving it from the value.

  `SheetContent` stops hardcoding its own composition: `portalProps` retargets where the sheet mounts, `overlayProps` restyles the scrim (a scrim that starts below an app topbar rather than at `inset-0`), `overlay` replaces it or removes it with `null`, and `showCloseButton={false}` suppresses the close button for a panel whose own header already carries one. `sheetVariants` and the `SheetContentProps` type are exported, so the skin can be taken without the composition.

  Add `useDebouncedValue` — the small hook behind the searchable controls' debounced term, exported at `@wakecap/core-ui/use-debounced-value`.

- 3507bb3: Add `MapControlPanel` — a collapsible floating control card for map surfaces. Declarative `selects` (single-choice `Select`, or the searchable `MultiSelect` with its removable pills) over `toggles`, on the standard card surface so it stays legible over imagery. It owns no map state; every row is controlled.

  `ObservationsMap` gains a `controls` slot that pins it to the top-left corner, mirroring how `timeline` pins the `TimeScrubber` to the bottom.

  `MultiSelect` (`@wakecap/core-ui/multi-select`) now accepts an `id`, forwarded to its trigger, so a `<Label htmlFor>` can address the field.

  Add `onClear`, which renders a Clear control in the header for resetting every filter at once, plus `width` (default `340`) and `maxHeight` (default `60vh`). The card caps its own height and the body scrolls beneath it, so a panel carrying several filters and their pills cannot outgrow the map it floats over — and the defaults match the floating detail panels, so the two agree on width and height.

  Rows accept `as: "chips"`, rendering their options as toggle `Chip`s instead of a dropdown — right for a handful of options, where a dropdown hides every choice behind a click. Options can carry a `color`, drawn as a swatch on the chip so a filter can be read against a legend.

  Rows accept `separatorBefore`, drawing a divider above the row — enough to split a panel into groups (filters above, display controls below) without a second list.

  The header collapse control uses the pane icons (`PanelLeftClose` / `PanelLeft`), matching the pane toggle in the AI chat header, instead of a rotating chevron. Its label reads Hide / Show map controls.

  `MultiSelect` (`@wakecap/core-ui/multi-select`) gains `maxPills` (default `4`). Beyond the cap the remaining selections collapse into a `+N` chip that opens them in a popover, each still removable — so a long selection no longer grows the field's height without bound. Pass `0` to keep the old always-show-everything behaviour. Every panel dropdown inherits it.

  Add `collapsedWidth` (default `160`). A collapsed panel carries only its title and toggle, so it narrows as well as shortens, with the width animating.

  Chip rows accept `chipColumns`, wrapping their options into an even grid instead of one row — a five-option row does not fit a panel at any label length.

  Add `fadeEdges`, which fades the whole card out at its top and bottom edges — surface, border and all — so a panel dissolves into what is behind it instead of ending on a hard rectangle.

- 3507bb3: Add `MapHoverCard` — the card shown while hovering a map marker: an optional media strip, a title, badges, a few label/value rows and a closing line. Sized to be read without moving the eye far, and carrying only what identifies the thing rather than duplicating its detail panel.

  `ObservationsMap` gains `renderHoverCard`. Markers are plain DOM outside React, so the widget tracks what is under the cursor and places the card above it; the caller supplies only the content, and can say something different for an observation, a camera and a responder.

- 3507bb3: Add `MapLegend` — a compact, foldable key for what is drawn on a map. Swatches take the shape of the thing they describe (circle, square, fill, line, dashed) and can carry the same glyph the marker uses, so the key and the map cannot disagree. Sections are declarative, and the card matches the other floating map panels.

  `ObservationsMap` gains a `legend` slot above the timeline, and exports its marker glyphs (`HAZARD_ICON`, `CAMERA_ICON`, `RESPONDER_ICON`) so a legend can reuse them rather than redraw them.

  The legend slot sits bottom-right, and `legendInline` drops it onto the timeline's own row — a collapsed `TimeScrubber` narrows to three-quarter width, which leaves exactly that space.

- 3507bb3: Add `ObservationDetailPanel` — the floating detail for one observation ticket: the record's fields, its lifecycle actions, and the `CommentThread` that doubles as its audit trail, with a `CommentComposer` for new comments. Fixed width with an internally scrolling body, so it can float over a map without outgrowing it.

  The record shape mirrors the Safety Manager list view (status, severity, source, category, company, zone, assignment, group count, false-positive), so the same violation reads identically opened from the map or the list. Lifecycle rules stay with the caller — pass whichever actions apply to the ticket's status and source.

  `ObservationsMap` gains a `detail` slot that pins it to the top-right corner.

  The comment composer is pinned to the foot of the panel rather than sitting inside the scrolling body, so it stays reachable however long the thread gets. `comments` render in the order given and read oldest-first — append new entries and they land directly above the composer, with the foot of the thread scrolled into view.

  `DetailPanelShell` gains a `footer` slot for that pinned region.

- 3507bb3: Add `ObservationsMap` — a Mapbox widget that drapes a georeferenced blueprint over the basemap and pins observations on top of it.

  The blueprint is an image source anchored by its four corners (`[top-left, top-right, bottom-right, bottom-left]`), so the plan stays locked to the ground while panning and zooming. Until a `blueprintUrl` is supplied, the widget draws the footprint outline from the same corners, which keeps the georeferencing verifiable without an image.

  Pass `fullHeight` to fill a height-constrained parent (e.g. an `h-dvh` flex column) instead of the default 500px.

  Pass `timeline` (a `TimeScrubberProps` object) to float the existing `TimeScrubber` — the same timeline the Workforce Map View uses — along the bottom edge of the map. The widget owns only the placement; filtering `observations` by the cursor time stays with the caller.

  Pass `zones` to draw site zone polygons over the map — each in its own colour, labelled, and clickable via `onZoneSelect`. Rings are sanitised before drawing: consecutive duplicate points (the spaces API repeats the closing point, sometimes several times) are collapsed and the ring is closed explicitly. `fitTo="zones"` frames the zones rather than the blueprint, which matters when a site footprint dwarfs the zones inside it.

  Observation markers are rounded-square badges rather than teardrop pins — coloured fill, light border ring, soft shadow, and a white glyph centred on the coordinate. The glyph defaults to lucide's `triangle-alert` (the hazard mark for a safety violation) and is overridable via `observationIcon`; `observationMarkerSize` sets the badge size. Markers are built as plain DOM, not React roots, so a few hundred of them stay cheap.

  Pass `cameras` to pin cameras on the map. Each renders as a slate badge with lucide's `cctv` glyph and an always-on notification-style count of the violations attributed to it (`99+` above 99), matching how an alert icon carries its count. The count is neutral rather than alarm-coloured — it says how many, not how bad — and renders as a circle for a single digit, widening into a pill beyond that. `showCameras`, `onCameraSelect`, `cameraIcon` and `cameraMarkerSize` configure them.

  `controls` floats arbitrary content — typically a `MapControlPanel` — in the map's top-left corner, mirroring how `timeline` floats the `TimeScrubber` along the bottom.

  Fix zones, the blueprint and its footprint disappearing whenever the basemap style changed. The overlay rebuild runs on `style.load`, but guarded itself on `isStyleLoaded()` — which is still false at that point — so it bailed and never re-added the layers. It now reschedules on `idle` instead. Only the initial style, which loads via `load`, ever drew them.

  Add `focusedIds` and `dimOpacity`. Ids in `focusedIds` stay at full strength while everything else on the map — other markers, zones, the blueprint — fades back, so a selection reads against a quiet map. Pass a single observation, or a camera together with the violations it caught.

  Observation and camera markers no longer open a mapbox popup — the detail panel carries the record, and a bubble over the pin covered the markers the selection is meant to be read against. Added `onBackgroundClick`, which fires when the map itself is clicked rather than a marker, so a floating panel can close on click-outside.

  Add `zoneColorMode`. `payload` (the default) keeps each zone's own colour; `neutral` replaces them with a quiet grey ramp, so the only colour on the map that carries meaning is the observation status. A payload can hold 80-plus distinct colours across overlapping zones, which reads as noise rather than information.

  Add `bearing` and `pitch` for the opening camera, and `onViewChange`, which reports `center` / `zoom` / `bearing` / `pitch` as the camera moves — the values needed to capture a framing and set it as the default.

  Camera markers use a filled video-camera glyph on a muted slate-blue badge (`#3d4a5c`), replacing the photo-camera badge. Observation badges are circular and cameras stay rounded-square at the same 20px size, so shape rather than size distinguishes them. Desaturated on purpose — a camera is context, not a finding, so it stays legible without competing with the status-coloured violations.

  Add `selectedZoneIds` and `selectionPadding`. Selected zones get a marching-ants outline and the map flies to fit them, so a zone picked from a list lands framed in the viewport — one zone or several. Selecting a zone lifts it and fades every other zone back — fill, outline and label together — so the selection stands alone while the surrounding geometry stays faintly readable. Clearing the selection eases back to the view the map opened on.

  Add `showResetView`, `resetViewLabel` and `resetViewWidth`. A reset control appears alongside the `controls` slot once the camera has left the view it opened on and eases back to it, so panning around is always recoverable without hunting for the original framing. It stays hidden until the view has actually moved, past a small tolerance so a nudge does not summon it, and is sized (default 160) and styled to match a collapsed `MapControlPanel` so the floating controls read as one set of modules.

  Fix a marker click also selecting the zone underneath it. Markers sit inside mapbox's canvas container, so a marker click fires the zone layer's click handler too — opening a violation dragged its zone into the selection with it.

  Zones draw as fills only — the per-zone outline stroke is gone. The selection's marching-ants outline is unaffected, so an outline on the map now means "selected" rather than "is a zone".

  The story's timeline frames data every five minutes rather than hourly. Violations arrive in bursts and an hourly bar averages a spike flat; five minutes also matches how often a responder's position is sampled, so a bar and a whereabouts describe the same instant. Axis ticks stay hourly — 288 ticks would render as a solid line.

  "Now" — and the opening window — is the last five minutes rather than the hour so far, matching the timeline frame. Widening the range is still a drag away; the default just answers "what is happening now" instead of "what has happened this hour".

  Observations that arrive without coordinates cannot be pinned. The story keeps them out of the map and lists them in a panel under the filters — always present, reading "none in this window" when empty rather than vanishing, using the same `ViolationList` rows as every other route into a ticket — clicking one opens the same right-hand panel a marker would, with the zone reported as unknown rather than guessed. The timeline readout counts them alongside the pinned and camera-held ones, so the totals still reconcile.

  The `controls` corner is bounded above the timeline and scrolls, so a tall stack of panels runs out of room rather than sliding underneath it. The bound follows `legendInline`, reclaiming the space a collapsed timeline gives up.

  The story's control panels start folded and the unlocated list starts open — the inverse of before. Filters and Settings are an aside to a map that is the actual content, and both are one click away; the unlocated list is not, because nothing on the map stands in for it. It also drops its border and keeps the edge fade, so it reads as a list lying on the map rather than a second control panel.

- 3507bb3: feat(ui): add the Work Permit template

  `WorkPermit`, exported from `@wakecap/core-ui/pages/core-work-permit`: the
  permit-management scaffold. Same shell as `CoreWorkforce` — CoreAppSidebar +
  CoreAppTopBar with a single "Work Permits" entry — and a route header carrying six tabs:
  Dashboard, Work Permits, Templates, Map, AI Agent (badged `SOON`) and Settings.

  Every tab body is a placeholder naming what belongs in it. The shell, the nav and the tab
  set are the decisions this template makes; the surfaces fill in later.

  Two deliberate divergences from Workforce: Settings is a peer tab rather than the icon
  action beside the tabs, and AI Agent carries a badge instead of being disabled — the tab
  opens and says what is coming rather than refusing to respond.

- 3507bb3: Add `ResponderDetailPanel` — the floating profile for one safety responder: identity and trade, the sent / acknowledged / closed alert tally, acknowledgement rate and response times, the platform mix they acknowledge from, and the companies, zones, packages and observation sources they cover. The record mirrors the Safety Manager responder list, so a responder reads the same opened from the map or the list.

  `ObservationsMap` gains `responders`, `showResponders`, `onResponderSelect`, `responderIcon` and `responderMarkerSize`. Responders draw as square badges like cameras — both are site fixtures rather than findings — with a filled guard glyph and their own hue, and an off-shift responder draws at reduced strength rather than disappearing.

  Responders sharing a coordinate with a camera are nudged clear of it, so neither badge can bury the other. The test and the offset are in pixel space and re-run on zoom, rotate and pitch — badges are a fixed pixel size, so a geographic offset that separates them at site zoom leaves them overlapping when zoomed out.

  `ObservationsMap` gains `coverage` — a radius in metres drawn around a point, for the ground a selected responder covers. The circle is a polygon in geographic space, so it stays true on the ground as the map zooms, and its longitude radius is divided by cos(latitude) so it reads as a circle rather than an ellipse away from the equator.

  The panel lists the violations assigned to the responder and, separately, those inside their coverage radius that are not theirs — the ones they are close enough to pick up — each row showing how far away it is and drilling into the full ticket with a way back.

  Both lists, and the camera panel's, render through a new shared `ViolationList` so the rows cannot drift apart between panels.

  Responders move, so a range selection cannot be answered with one point. `ObservationsMap` gains `track` — the responder's path through the selected window as one segment per unbroken run of contact, drawn as a dashed line inside a corridor of `radiusMeters`. Contact drops, and joining the point before a gap to the point after would draw a walk that may never have happened and claim coverage over ground nobody was on, so a gap is drawn as a gap. The corridor is the path stroked at twice the radius with round caps and joins, which is exactly the ground within that radius of the path, with no buffer geometry; its width is recomputed from metres on every zoom so the ground it covers stays constant.

  The panel's "In range" list is now judged per violation, at the moment each was reported, against where the responder actually stood then — over a range, a single circle both misses violations they could have reached and claims ones they could not.

  A run where the responder never moved is drawn as a disc rather than a corridor, outlined only when no corridor accompanies it — beside a band, a dashed circle reads as a separate object rather than the same coverage — a line has nothing to stroke, and mapbox drops one shorter than about a metre as too small to tile. A focused responder is also exempt from the camera de-collision nudge, so its coverage centres on the badge rather than on the camera it was moved away from.

- 3507bb3: Add `ObservationsMapView` (`@wakecap/core-ui/pages/core-observations-map-view`) — the Observations Map as a whole working view: a day of observations over the RNGLF site with the cameras that caught them and the responders who work them, a five-minute timeline, filter and display panels, an unlocated queue, a key, and the ticket / camera / responder panels a marker opens. Everything it draws is generated inside it, so it runs with no data wiring, and it fills whatever height its parent gives it.

  Safety Manager's Map View renders that view, replacing the placeholder basemap centred on Riyadh, which showed nothing at all.

  The view was the `ObservationsMap` story's own scene. Moving it into the package means the story and the template show the same map rather than two copies of one demo — the story now renders `ObservationsMapView` inside a full-height wrapper and keeps only its docs.

  The RNGLF zone fixture moved into the package too, as `@wakecap/core-ui/data/rnglf-zones`, since the view needs it from inside the package.

  Remove a duplicate `MapZone` interface declaration in `observations-map` — identical, so it merged rather than erroring, but only one is the definition.

- 3507bb3: Add `size` to `Switch` — `sm` (16×28 track, 12px thumb) alongside the existing default (20×36, 16px thumb), for dense surfaces like floating panels and toolbars. The thumb's travel is derived from the size, so it can't be produced by a class override on the root alone. Existing usage is unchanged.

  `MapControlPanel` toggles now use it.

- 3507bb3: feat(ui): promote the process builder out of the Connect V3 template into a widget

  The state-machine editor lived inside the Connect V3 process page and could not be
  mounted anywhere else. It is now `ProcessBuilder`, exported from
  `@wakecap/core-ui/pages/process-builder`, with a `variant` axis (`full` | `canvas` |
  `work-permit`) as the declared extension point. `ProcessDetail` mounts it in its
  `full` variant, so the page and the widget share one implementation and cannot drift.

  `work-permit` is the Digital Work Permit cut: the same shell as `full`, re-cut as
  General, Canvas, Form, then a rule, then Instances and Bottlenecks. General is the
  Settings section renamed, carrying the permit's type and description beside the record's
  own name and icon. `formSlot` fills the Form section.

  Section order, grouping, the rule between groups and the Settings/General rename are all
  rows in one `VARIANT_TRAITS` table rather than branches in the render. `ProcessDetail` is
  now a thin wrapper over `variant="full"` and renders exactly what it always did.

  `SideMenuGroup` gained an optional `divider`, which draws a rule above a group — without
  it two unlabelled groups are separated by 2px and read as one list.

- 3507bb3: Add an optional `legend` to `TimeScrubber` — a row of small swatches in the header for reading a stacked `segments` track. Each entry takes a `label` plus either a `color` or a `className` matching the segment it describes.

  Add `rangeValue` / `onRangeValueChange` — a second handle that turns the track into a window. Drag either end; the band between them is the selection, and the ends clamp against each other rather than crossing. The handle is chosen on pointer-down and held for the gesture, so dragging one end past the other doesn't hand the drag over. `value` still drives the playhead, so a range and a cursor coexist.

  `collapsed` / `onCollapsedChange` make the collapse state controllable, so a surrounding layout can react to it rather than guess.

## 0.12.0

### Minor Changes

- efc802d: feat(ui): make CoreAppSidebar/CoreAppTopBar localizable and report the selected item's id

  - **WC-GAP-03 (i18n):** `CoreAppSidebar` and `CoreAppTopBar` hardcoded English copy (search placeholders, "Log Out", "No results", the feedback item, and many `aria-label`s) with no way to translate it. Both now accept a `labels?` object — typed as `CoreAppSidebarLabels` / `CoreAppTopBarLabels` (both exported) — whose keys override the built-in strings; any key left unset keeps its English default, so existing callers are unaffected. Dynamic strings are small functions (e.g. `collapseGroup: (name) => …`, `noResultsHint: (query) => …`). Nav-item labels, org/user names, and other consumer data are unchanged — they already arrive localized via their own props.
  - **WC-GAP-04 (selection by id):** `CoreAppSidebar` gains `onNavigateItem?: (item, parent?) => void`, fired alongside `onNavigate` for every selection. It hands back the selected `SidebarNavItem`/`SidebarSubItem` (and the parent item for a sub-menu row), so consumers can track selection by the stable `id` — `onNavigateItem={(item) => setActiveItemId(item.id)}` — instead of reverse-mapping the `label` string `onNavigate` reports. `onNavigate` is unchanged.

## 0.11.0

### Minor Changes

- 41b259c: fix(ui): honour RTL and fix nav group-label contrast in CoreAppSidebar; add useDocumentDir

  - **WC-GAP-01 (RTL):** The nav list is wrapped in a Radix `ScrollArea`, which stamps an explicit `dir` on its root and falls back to `"ltr"` when it finds neither a `dir` prop nor a `DirectionProvider`. That hard `"ltr"` halted inheritance of an RTL host's direction, pinning the nav list left-to-right while the rest of the shell mirrored. The sidebar now reads the document direction and threads it through the nav `ScrollArea`s, and nav-row labels use the logical `text-start` instead of physical `text-left`, so the nav follows the ambient direction.
  - **WC-GAP-02 (contrast):** The nav group-label caption rendered at `text-muted-foreground/40` — roughly `1.69:1` against the sidebar at 10px, below the `4.5:1` that WCAG 2.1 SC 1.4.3 (AA) requires for small text. It now uses full-opacity `--muted-foreground` (~`4.7:1` in light, ~`5.0:1` in dark).
  - **New hook:** the ambient-direction reader is now a reusable `useDocumentDir()` hook, exported at `@wakecap/core-ui/use-document-dir`, so any component can become RTL-aware the same way.

## 0.10.0

### Minor Changes

- 6793b71: Add `FloorProgressBar` — a thin determinate progress bar with a marker tick, sized to overlay the bottom edge of a floor tile.
- be661fd: Add `FormDialog` and `WizardDialog` — the two authoring shells the library had been hand-copying.

  `FormDialog` is a single-step create/edit modal that owns the house required-field contract: a submit that is never disabled, per-field errors that appear only once a submit has actually been refused, and a reset that runs on close as well as on success. Fields declare plain validity via `FormDialogField invalid`; the dialog owns the timing. `WizardDialog` carries the same rule across steps, owning the Stepper rail, the "Step N of M" counter, and Back/Next/submit, with only the current step mounted.

  `NewProcessDialog` and `NewPipelineDialog` in the WakeCap Connect templates now build on `FormDialog` rather than re-deriving it.

- be661fd: Add `CatalogueViewToggle`, `RecordDetailShell`, `GraphCanvas` and `AssetListItem` — the four remaining duplicated surfaces from the template review.

  `CatalogueViewToggle` (with `CatalogueCardGrid` and `useCatalogueViewMode`) is the persisted table-or-cards switch four catalogue pages had each re-typed. It deliberately does not wrap `DataTable`: those pages protect an invariant in comments — one table stays mounted for the life of the view — so the mode reaches it through `showColumnToggle` and `renderGrid` and nothing else.

  `RecordDetailShell` is the rail-beside-content row of the four detail pages that earn a section rail, owning the `md` column flip, the `min-h-0` scroll chain and the unpadded scroll owner. `flush` places a section that owns the page height, such as a graph canvas, outside the padded well.

  `GraphCanvas` is the themed `@xyflow/react` surface behind the process, pipeline, lineage and ontology canvases, which had already drifted — three padded `fitView` and one did not.

  `AssetListItem` is the thumbnail row that appeared three times in one template, with the thumbnail overlay and the meta line as slots.

- 6793b71: Add `HouseShape` — an isometric SVG house tile with token-driven palettes and hover/selected states for blueprint / site navigators.
- 6793b71: Add `KioskBody` — an always-on TV kiosk panel that auto-advances through a villa's weekly overview and task walkthrough.
- 6793b71: Add `Minimap` — a compact, north-rotating satellite minimap with a centre pin and heading view-cone (ArcGIS tile fallback).
- 6793b71: Add `NeighborhoodScene` — an isometric SVG neighborhood plan with interactive, token-driven house hit-shapes (idle / hover / selected).
- 6793b71: Add `ScheduleWeekBar` — a compact week stepper with prev/next paging and a 4D-timeline play trigger.
- 6793b71: Add `SingleHouseView` — a single-building fragment viewer with a stacked-floor model stage, streaming loading veil, and a floor rail.
- 6793b71: Add `StageContent` — the fragment/3D viewer stage: canvas with overlay header, control toolbar, loading veil, and a floor/section rail.
- 6793b71: Add `TabsDropdownTrigger` — a tab that opens a dropdown of sub-views (activates the tab and opens the menu on click), inheriting the surrounding `Tabs` variant (e.g. `underline`).
- 6793b71: Add `WalkthroughTile` — an autoplaying muted walkthrough clip with hover-revealed play/pause and a fullscreen control.
- 6793b71: Add `floor`, `floating`, `object`, and `tv` surface variants to `Card` (frosted panels migrated from the Capture app) and cover the existing `stat` variant with a story and co-located tests.
- 37c3f65: Give `DataTable` a first-class row activation contract (#207).

  A table whose primary record is the navigation target had no way to say so: consumers put a link in
  one cell and repeated an Open action, leaving the row itself inert.

  - `getRowHref(row)` makes the **whole row** the link. A real anchor does the navigating, so
    ⌘/Ctrl-click and middle-click open a new tab and the browser's own context menu offers _Copy link
    address_ — none of which a synthetic click handler provides.
  - `onRowActivate(row)` for destinations that are not addressable (a drawer, a split view).
  - `getRowAriaLabel(row)` names the row; without it a wide row announces its entire text content.

  Pointer and keyboard are equivalent — click, **Enter**, or **Space** (prevented from scrolling) — and
  activatable rows take a tab stop with a visible focus ring.

  Nested controls keep their own click: anything matching a link, button, input, label, checkbox or menu
  item claims the event, so selecting a row's checkbox or opening its action menu does not also activate
  the row. Skeleton and empty-state rows are never activatable.

  All three props are optional. A table that supplies none renders exactly as before — verified across
  the existing Default, Expandable, WithBulkActions, WithActionsColumn, EmptyState and TreeRows stories:
  zero activatable rows, zero tab stops.

- d752edd: DataTable: two additive, default-off props.

  - `renderGrid?: (rows) => ReactNode` replaces the bordered table block with a caller-supplied
    rendering of the SAME rows, while the toolbar, applied-filter chips, record count and pager keep
    rendering off this table's state — so a table⇄card toggle preserves query, filters, sort and page.
  - `initialColumnVisibility?: VisibilityState` seeds column visibility so a column can ship hidden
    until asked for. Uncontrolled after mount.

  Both default to `undefined`, so every existing table renders exactly as before.

- be661fd: Export the six ontology authoring wizards, and give the library's 41 unmanifested exports a manifest.

  `NewObjectTypeDialog`, `NewLinkTypeDialog`, `NewActionTypeDialog`, `NewInterfaceDialog`, `NewTypeGroupDialog` and `NewSharedPropertyDialog` were already exported components with typed props and no fixture coupling — they were simply absent from the package `exports` map, so nothing outside the monorepo could reach them. They now have flow-shaped import paths, complete manifests, Storybook stories and Designer Hub pages.

  Separately, 41 modules that `@wakecap/core-ui` publicly exports had no manifest at all, which meant they did not exist to the builder, to `library-index.json`, or to any agent selecting components — the discoverability gap that makes an author write their own copy. Each now carries a manifest whose intent is taken verbatim from the module's own doc comment. They are marked `stub`: the intent is accurate, the data contract is not yet authored.

- be661fd: Promote seven WakeCap Connect flows out of the templates and into the design system.

  Each was reachable only by rendering the whole Connect workspace: `CreateProcessDialog` (extracted from the process list view, where it was a private function), `InstallProductDialog` with its `computeInstallPlan` planner, `RunActionDialog`, `AnalysisWorkbench`, `AppMarketplace`, `LineageImpactView` and `HealthView`. All seven now have a flow-shaped import path, a complete manifest, a catalog entry, a Storybook story and a Designer Hub page, so they can be used on their own or built on.

  The import subpaths name the flow rather than the file — `@wakecap/core-ui/pages/create-process-dialog`, `.../install-product-dialog`, `.../run-action-dialog`, `.../analysis-workbench`, `.../app-marketplace`, `.../lineage-impact-view`, `.../health-view` — and the fixture modules their props reference are exported alongside them.

- fca7311: Add a Responder List (Verify Response) tab to the Safety Manager template: responder/controller
  rosters with a KPI band, a slide-over responder profile panel, responder assignment on observation
  lifecycle actions, and an activity audit trail in the comment thread.

  Rows in the roster are activated through `DataTable`'s existing `onRowActivate`. This branch
  originally added a separate `onRowClick` prop for the same job; `onRowActivate` landed on `develop`
  first and does strictly more — pointer _and_ keyboard (Enter/Space), a focus ring, an accessible name,
  and the same guard so clicks on nested buttons, links and menu items keep working. Two props for one
  gesture would have been the worse outcome, so the roster uses the one that already exists.

- 37c3f65: Self-host the WakeCore typefaces (#208).

  The tokens declared `Figtree` / `IBM Plex Mono` / `Lora`, but the only thing that loaded them was an
  `@import` from the Google Fonts CDN. That made the declared typography a **runtime dependency on a
  third-party host**: offline builds, air-gapped installs and CSP-restricted apps silently rendered a
  system fallback while still looking token-compliant, and screenshots varied by whether the host
  happened to have the font installed.

  All three families now ship as WOFF2 inside `@wakecap/core-tokens` (latin + latin-ext, ~290 KB), and
  `@wakecap/core-ui` copies them beside its pre-built CSS so `styles.css` resolves them relative to
  itself. No external request, and `font-src 'self'` is sufficient.

  - `node scripts/vendor-fonts.mjs` re-vendors the files and regenerates `fonts.css`.
  - Licensing is documented in `packages/tokens/src/fonts/LICENSE.md` — all three are OFL-1.1, which
    permits redistribution.
  - A `Typography → FontResources` story pins headings, body copy, weights, table text, tabular
    numerals, compact nav, mono and serif, so a regression shows up as a pixel diff.

  Consumers who added the Google Fonts `<link>` can drop it; the docs no longer ask for it.

- 37c3f65: Give `CoreAppTopBar` a responsive contract (#205).

  The breadcrumb was positioned `absolute left-1/2`, so it sat outside the flow: the project switcher on
  one side and the actions on the other reserved no space for it, and nothing truncated. Once the bar
  got narrow — most visibly in the 768–820px band — the three groups simply overlapped.

  The bar is now a three-column grid. Equal `1fr` side columns keep the middle genuinely centred while
  reserving space, `min-w-0` lets the sides truncate instead of shoving, and the project name truncates
  rather than widening its cell.

  Ancestor breadcrumb segments fold away as the bar narrows — narrowest first, behind an ellipsis — so
  the **route identity is the last thing to go**. Sizing is driven by container queries, not viewport
  breakpoints, because the bar's width depends on the sidebar: a 1024px window with a 260px sidebar
  leaves ~764px, squarely in the failing band.

  New `overflowActions` prop: lower-priority actions render inline while there is room and collapse into
  a single "More actions" menu when there is not. Each entry's `label` is both the menu text and the
  inline control's accessible name.

  Verified at 1200 / 820 / 768 / 520 / 375px with a five-segment route and a 56-character project name:
  no overlap, no overflow, every control still named. Compact density is unchanged (44px / 36px).

- 39cf6c7: WakeCap Connect V1–V3, and the sidebar capabilities they needed.

  **Templates.** WC3 Workspace and AppInstaller are grouped as WakeCap Connect **V1** (admin portal +
  end-user portal). **V2** (`pages/core-wakecap-connect`) merges them into one app. **V3**
  (`pages/core-wakecap-connect-v3`) re-cuts V2 around the project lifecycle: installed apps grouped
  Design / Plan / Capture / Pay, and the Marketplace carried inside Studio. V2 and V3 are thin aliases
  over `CoreWC3Workspace` — the whole difference is props — so the three releases share one
  implementation and cannot drift.

  **New widget** — `activity-sheet`. The app shell's notifications + changeset panel as an ordinary
  right-hand `Sheet`: standard overlay, standard cards, standard buttons. Takes
  `NotificationCenter`'s `NotificationItem` / `ChangeEntry`, so a shell can feed both streams from the
  state it already keeps. Choose it over `NotificationCenter` when the panel should sit flush with the
  rest of the shell rather than carry its own visual language.

  **`CoreAppSidebar` — groups become destinations.** All additive and default-off, so every existing
  sidebar renders unchanged:

  - `SidebarNavGroup.icon` renders the group as a tree — parent-sized header, a spine down to the last
    item, an elbow into each — and, collapsed, folds the whole section into that one icon whose flyout
    lists its items. That flyout is the SAME component an `expandable` item's `subMenu` already used,
    so a group and an item cannot behave differently.
  - `SidebarNavGroup.id` + `onGroupSelect` / `activeGroupId` make the group's name a link to its own
    page, marked while that page is open. `collapsible` adds a fold chevron beside it — two separate
    targets in one header. Expanding and folding animate; folded rows are `inert` so focus never lands
    on a row nobody can see.
  - `groupsCollapsedByDefault` starts groups shut, with a toggle beside the find bar to fold or open
    them all. `brandName`, `showHomeDivider`, `showGroupDividers` and `SidebarNavGroup.dividerBefore`
    tune the chrome.

  **Fixes:**

  - The collapsed rail flattened every nav group into one undifferentiated run of icons, so collapsing
    a sidebar lost the section boundaries the expanded one shows. It now draws the same dividers.
  - With one rail flyout open, clicking a different icon was spent dismissing the first — switching
    took two clicks. It now switches on the first.
  - Nav rows ran under the scrollbar. They now stop clear of it.

  **Additive elsewhere:**

  - `CoreAppTopBar.breadcrumb` — a structured `{label, onSelect}[]` whose segments can be links, so a
    breadcrumb can lead with a clickable group. The string `activeLabel` is untouched.
  - `ScrollArea.scrollbarClassName` / `thumbClassName` — for a thinner, lighter scrollbar on a dense
    surface, without restyling every scrollable surface in the library.

- d752edd: WC3 Workspace template, plus the primitive changes it needed.

  **New template** — `pages/core-wc3-workspace`, an admin workspace ported from the WC3 ontology-manager
  prototype. Perspectives: Home, Analysis, Processes, Pipelines, Products, Lineage, Ontology. Fixtures
  are extracted verbatim from the prototype's store rather than hand-authored.

  **Primitive fixes (bugs, not features):**

  - `Badge` now forwards refs. As a plain function component it broke inside any `asChild` wrapper —
    React warned "Function components cannot be given refs" and the tooltip silently never bound.
  - `Dialog`, `AlertDialog`, `Sheet`, `Drawer` and `FloatingAssistant` set a text colour alongside
    their background. They set `bg-card` with no foreground, so being portalled outside the app root
    they inherited the host's body colour — near-black text on a dark surface in dark mode.
    `--card-foreground` equals `--foreground` in both themes, so this is a no-op where inheritance
    already worked.
  - `Accordion` gained `min-w-0` on its header and trigger. A flex item defaults to `min-width: auto`,
    so a long label refused to shrink, pushed the chevron out of the row and overflowed the panel; a
    consumer's `truncate` could not take effect.
  - `accordion-down` / `accordion-up` animations are now DEFINED. The component has always referenced
    them, but no keyframes existed anywhere, so every accordion in the system snapped open.

  **Additive, default-off props** (existing call sites render unchanged):

  - `DataTable.flushToolbar` — drops the toolbar's top padding for a table inside a surface that
    already provides one.
  - `Combobox` options take an optional `icon`, so a picker with per-option identity can stay
    searchable instead of falling back to `Select`.

  **Tokens:** a `.wwc-invert` scope that runs a subtree on the opposite theme, built by extending the
  existing `:root` / `.dark` selector lists so there is still one source of truth per theme.

### Patch Changes

- 706faad: Deprecate the zero-prop page-template prototype exports (`AdminPanel`, `AnalyticsOverview`, `Clinic`, `Workforce`, and the other zero-prop `pages/core-*` prototypes). These render built-in demo data and mock handlers and are **not** supported production imports — they are Storybook previews of how a module should look. Compose your own page from the widgets each template uses, wired to your data, instead of importing the prototype.

  The exports still resolve (no runtime change), but are now marked `@deprecated` and slated for removal from the public API in a future major. Parameterized templates that take real props — `LoginPage`, `ErrorPage`, and the `Project*` / `Org*` overview pages — are unaffected.

- 37c3f65: Stop the FragmentViewer stage flashing when its container animates (#201).

  Collapsing the app sidebar animates its width for 200ms. The viewer observed the container and called
  `renderer.resize()` on every observation — and resizing reassigns the canvas backing buffer, which
  **clears it**. The stage was therefore blanked repeatedly mid-animation, which is the flash reported
  in the Workforce Map View.

  Resizes are now coalesced: CSS scales the existing buffer while the size is still moving, and one real
  resize happens once it settles. Measured on a single collapse, buffer reassignments drop from 2 to 1 —
  and the one that remains is inherent, since the buffer has to be resized once for the new size.

  Not a remount: the canvas element survives the toggle, which this change confirms rather than alters.

- Updated dependencies [37c3f65]
- Updated dependencies [d752edd]
  - @wakecap/core-tokens@0.7.0

## 0.9.0

### Minor Changes

- 3788864: Give `DataTable` a first-class row activation contract (#207).

  A table whose primary record is the navigation target had no way to say so: consumers put a link in
  one cell and repeated an Open action, leaving the row itself inert.

  - `getRowHref(row)` makes the **whole row** the link. A real anchor does the navigating, so
    ⌘/Ctrl-click and middle-click open a new tab and the browser's own context menu offers _Copy link
    address_ — none of which a synthetic click handler provides.
  - `onRowActivate(row)` for destinations that are not addressable (a drawer, a split view).
  - `getRowAriaLabel(row)` names the row; without it a wide row announces its entire text content.

  Pointer and keyboard are equivalent — click, **Enter**, or **Space** (prevented from scrolling) — and
  activatable rows take a tab stop with a visible focus ring.

  Nested controls keep their own click: anything matching a link, button, input, label, checkbox or menu
  item claims the event, so selecting a row's checkbox or opening its action menu does not also activate
  the row. Skeleton and empty-state rows are never activatable.

  All three props are optional. A table that supplies none renders exactly as before — verified across
  the existing Default, Expandable, WithBulkActions, WithActionsColumn, EmptyState and TreeRows stories:
  zero activatable rows, zero tab stops.

- 3788864: DataTable: two additive, default-off props.

  - `renderGrid?: (rows) => ReactNode` replaces the bordered table block with a caller-supplied
    rendering of the SAME rows, while the toolbar, applied-filter chips, record count and pager keep
    rendering off this table's state — so a table⇄card toggle preserves query, filters, sort and page.
  - `initialColumnVisibility?: VisibilityState` seeds column visibility so a column can ship hidden
    until asked for. Uncontrolled after mount.

  Both default to `undefined`, so every existing table renders exactly as before.

- 3788864: Self-host the WakeCore typefaces (#208).

  The tokens declared `Figtree` / `IBM Plex Mono` / `Lora`, but the only thing that loaded them was an
  `@import` from the Google Fonts CDN. That made the declared typography a **runtime dependency on a
  third-party host**: offline builds, air-gapped installs and CSP-restricted apps silently rendered a
  system fallback while still looking token-compliant, and screenshots varied by whether the host
  happened to have the font installed.

  All three families now ship as WOFF2 inside `@wakecap/core-tokens` (latin + latin-ext, ~290 KB), and
  `@wakecap/core-ui` copies them beside its pre-built CSS so `styles.css` resolves them relative to
  itself. No external request, and `font-src 'self'` is sufficient.

  - `node scripts/vendor-fonts.mjs` re-vendors the files and regenerates `fonts.css`.
  - Licensing is documented in `packages/tokens/src/fonts/LICENSE.md` — all three are OFL-1.1, which
    permits redistribution.
  - A `Typography → FontResources` story pins headings, body copy, weights, table text, tabular
    numerals, compact nav, mono and serif, so a regression shows up as a pixel diff.

  Consumers who added the Google Fonts `<link>` can drop it; the docs no longer ask for it.

- 3788864: Give `CoreAppTopBar` a responsive contract (#205).

  The breadcrumb was positioned `absolute left-1/2`, so it sat outside the flow: the project switcher on
  one side and the actions on the other reserved no space for it, and nothing truncated. Once the bar
  got narrow — most visibly in the 768–820px band — the three groups simply overlapped.

  The bar is now a three-column grid. Equal `1fr` side columns keep the middle genuinely centred while
  reserving space, `min-w-0` lets the sides truncate instead of shoving, and the project name truncates
  rather than widening its cell.

  Ancestor breadcrumb segments fold away as the bar narrows — narrowest first, behind an ellipsis — so
  the **route identity is the last thing to go**. Sizing is driven by container queries, not viewport
  breakpoints, because the bar's width depends on the sidebar: a 1024px window with a 260px sidebar
  leaves ~764px, squarely in the failing band.

  New `overflowActions` prop: lower-priority actions render inline while there is room and collapse into
  a single "More actions" menu when there is not. Each entry's `label` is both the menu text and the
  inline control's accessible name.

  Verified at 1200 / 820 / 768 / 520 / 375px with a five-segment route and a 56-character project name:
  no overlap, no overflow, every control still named. Compact density is unchanged (44px / 36px).

- 3788864: WakeCap Connect V1–V3, and the sidebar capabilities they needed.

  **Templates.** WC3 Workspace and AppInstaller are grouped as WakeCap Connect **V1** (admin portal +
  end-user portal). **V2** (`pages/core-wakecap-connect`) merges them into one app. **V3**
  (`pages/core-wakecap-connect-v3`) re-cuts V2 around the project lifecycle: installed apps grouped
  Design / Plan / Capture / Pay, and the Marketplace carried inside Studio. V2 and V3 are thin aliases
  over `CoreWC3Workspace` — the whole difference is props — so the three releases share one
  implementation and cannot drift.

  **New widget** — `activity-sheet`. The app shell's notifications + changeset panel as an ordinary
  right-hand `Sheet`: standard overlay, standard cards, standard buttons. Takes
  `NotificationCenter`'s `NotificationItem` / `ChangeEntry`, so a shell can feed both streams from the
  state it already keeps. Choose it over `NotificationCenter` when the panel should sit flush with the
  rest of the shell rather than carry its own visual language.

  **`CoreAppSidebar` — groups become destinations.** All additive and default-off, so every existing
  sidebar renders unchanged:

  - `SidebarNavGroup.icon` renders the group as a tree — parent-sized header, a spine down to the last
    item, an elbow into each — and, collapsed, folds the whole section into that one icon whose flyout
    lists its items. That flyout is the SAME component an `expandable` item's `subMenu` already used,
    so a group and an item cannot behave differently.
  - `SidebarNavGroup.id` + `onGroupSelect` / `activeGroupId` make the group's name a link to its own
    page, marked while that page is open. `collapsible` adds a fold chevron beside it — two separate
    targets in one header. Expanding and folding animate; folded rows are `inert` so focus never lands
    on a row nobody can see.
  - `groupsCollapsedByDefault` starts groups shut, with a toggle beside the find bar to fold or open
    them all. `brandName`, `showHomeDivider`, `showGroupDividers` and `SidebarNavGroup.dividerBefore`
    tune the chrome.

  **Fixes:**

  - The collapsed rail flattened every nav group into one undifferentiated run of icons, so collapsing
    a sidebar lost the section boundaries the expanded one shows. It now draws the same dividers.
  - With one rail flyout open, clicking a different icon was spent dismissing the first — switching
    took two clicks. It now switches on the first.
  - Nav rows ran under the scrollbar. They now stop clear of it.

  **Additive elsewhere:**

  - `CoreAppTopBar.breadcrumb` — a structured `{label, onSelect}[]` whose segments can be links, so a
    breadcrumb can lead with a clickable group. The string `activeLabel` is untouched.
  - `ScrollArea.scrollbarClassName` / `thumbClassName` — for a thinner, lighter scrollbar on a dense
    surface, without restyling every scrollable surface in the library.

- 3788864: WC3 Workspace template, plus the primitive changes it needed.

  **New template** — `pages/core-wc3-workspace`, an admin workspace ported from the WC3 ontology-manager
  prototype. Perspectives: Home, Analysis, Processes, Pipelines, Products, Lineage, Ontology. Fixtures
  are extracted verbatim from the prototype's store rather than hand-authored.

  **Primitive fixes (bugs, not features):**

  - `Badge` now forwards refs. As a plain function component it broke inside any `asChild` wrapper —
    React warned "Function components cannot be given refs" and the tooltip silently never bound.
  - `Dialog`, `AlertDialog`, `Sheet`, `Drawer` and `FloatingAssistant` set a text colour alongside
    their background. They set `bg-card` with no foreground, so being portalled outside the app root
    they inherited the host's body colour — near-black text on a dark surface in dark mode.
    `--card-foreground` equals `--foreground` in both themes, so this is a no-op where inheritance
    already worked.
  - `Accordion` gained `min-w-0` on its header and trigger. A flex item defaults to `min-width: auto`,
    so a long label refused to shrink, pushed the chevron out of the row and overflowed the panel; a
    consumer's `truncate` could not take effect.
  - `accordion-down` / `accordion-up` animations are now DEFINED. The component has always referenced
    them, but no keyframes existed anywhere, so every accordion in the system snapped open.

  **Additive, default-off props** (existing call sites render unchanged):

  - `DataTable.flushToolbar` — drops the toolbar's top padding for a table inside a surface that
    already provides one.
  - `Combobox` options take an optional `icon`, so a picker with per-option identity can stay
    searchable instead of falling back to `Select`.

  **Tokens:** a `.wwc-invert` scope that runs a subtree on the opposite theme, built by extending the
  existing `:root` / `.dark` selector lists so there is still one source of truth per theme.

### Patch Changes

- 3788864: Deprecate the zero-prop page-template prototype exports (`AdminPanel`, `AnalyticsOverview`, `Clinic`, `Workforce`, and the other zero-prop `pages/core-*` prototypes). These render built-in demo data and mock handlers and are **not** supported production imports — they are Storybook previews of how a module should look. Compose your own page from the widgets each template uses, wired to your data, instead of importing the prototype.

  The exports still resolve (no runtime change), but are now marked `@deprecated` and slated for removal from the public API in a future major. Parameterized templates that take real props — `LoginPage`, `ErrorPage`, and the `Project*` / `Org*` overview pages — are unaffected.

- 3788864: Stop the FragmentViewer stage flashing when its container animates (#201).

  Collapsing the app sidebar animates its width for 200ms. The viewer observed the container and called
  `renderer.resize()` on every observation — and resizing reassigns the canvas backing buffer, which
  **clears it**. The stage was therefore blanked repeatedly mid-animation, which is the flash reported
  in the Workforce Map View.

  Resizes are now coalesced: CSS scales the existing buffer while the size is still moving, and one real
  resize happens once it settles. Measured on a single collapse, buffer reassignments drop from 2 to 1 —
  and the one that remains is inherent, since the buffer has to be resized once for the new size.

  Not a remount: the canvas element survives the toggle, which this change confirms rather than alters.

- Updated dependencies [3788864]
- Updated dependencies [3788864]
  - @wakecap/core-tokens@0.6.0

## 0.8.0

### Minor Changes

- 03098b0: DataTable: two additive, default-off props.

  - `renderGrid?: (rows) => ReactNode` replaces the bordered table block with a caller-supplied
    rendering of the SAME rows, while the toolbar, applied-filter chips, record count and pager keep
    rendering off this table's state — so a table⇄card toggle preserves query, filters, sort and page.
  - `initialColumnVisibility?: VisibilityState` seeds column visibility so a column can ship hidden
    until asked for. Uncontrolled after mount.

  Both default to `undefined`, so every existing table renders exactly as before.

- 03098b0: WC3 Workspace template, plus the primitive changes it needed.

  **New template** — `pages/core-wc3-workspace`, an admin workspace ported from the WC3 ontology-manager
  prototype. Perspectives: Home, Analysis, Processes, Pipelines, Products, Lineage, Ontology. Fixtures
  are extracted verbatim from the prototype's store rather than hand-authored.

  **Primitive fixes (bugs, not features):**

  - `Badge` now forwards refs. As a plain function component it broke inside any `asChild` wrapper —
    React warned "Function components cannot be given refs" and the tooltip silently never bound.
  - `Dialog`, `AlertDialog`, `Sheet`, `Drawer` and `FloatingAssistant` set a text colour alongside
    their background. They set `bg-card` with no foreground, so being portalled outside the app root
    they inherited the host's body colour — near-black text on a dark surface in dark mode.
    `--card-foreground` equals `--foreground` in both themes, so this is a no-op where inheritance
    already worked.
  - `Accordion` gained `min-w-0` on its header and trigger. A flex item defaults to `min-width: auto`,
    so a long label refused to shrink, pushed the chevron out of the row and overflowed the panel; a
    consumer's `truncate` could not take effect.
  - `accordion-down` / `accordion-up` animations are now DEFINED. The component has always referenced
    them, but no keyframes existed anywhere, so every accordion in the system snapped open.

  **Additive, default-off props** (existing call sites render unchanged):

  - `DataTable.flushToolbar` — drops the toolbar's top padding for a table inside a surface that
    already provides one.
  - `Combobox` options take an optional `icon`, so a picker with per-option identity can stay
    searchable instead of falling back to `Select`.

  **Tokens:** a `.wwc-invert` scope that runs a subtree on the opposite theme, built by extending the
  existing `:root` / `.dark` selector lists so there is still one source of truth per theme.

### Patch Changes

- Updated dependencies [03098b0]
  - @wakecap/core-tokens@0.5.0

## 0.7.0

### Minor Changes

- 517bf13: Add `BlueprintSegment` — one cell of a multi-floor blueprint split: a framed blueprint (or a “No blueprint” placeholder), a floor label + % chip, and an optional walk-through button (`onWalkthrough`). Tile several to build a split canvas.
- 517bf13: Add the `BlueprintViewer3` page template (`@wakecap/core-ui/pages/core-blueprint-viewer-3`) — a v3 blueprint-viewer layout variant: a fixed multi-floor split canvas (drag to pan), a collapsed drill-down canvas navigator (compound → zone → house → floor) top-left, and a scrollable full-height details panel (approved-vs-planned progress, a collapsible milestones table, and a Building Progress floor list), framed by a breadcrumb + week-selector metric bar with a full-screen toggle.
- 517bf13: Add `BuildingModelPlaceholder` — a dependency-free CSS-3D building placeholder (one extruded box per floor, drag-to-orbit, click-to-select) to show a building's floors when a real BIM / 3D model isn't available yet.
- 517bf13: Add `BuildingProgress` component — a building elevation progress stack. One row per floor (ordered top → bottom) shows a completion bar and percentage, tapering wider toward the base like a building silhouette. The `activeId` floor is highlighted; pass `onFloorSelect` to make the rows interactive. Supports `default` / `compact` sizes and a configurable `taperStep`.
- 517bf13: Add `CanvasHeader` — the canvas-level header bar: a `left` (breadcrumb, single-line + truncating), optional `center`, and a `right` cluster with an optional built-in `weekSelector` + your actions. Heads a single workspace canvas (distinct from the platform `CoreAppTopBar`); pairs with `ViewTabBar` / `CanvasToolbar`.
- 517bf13: Add `CaptureRouteMinimap` — a floating, resizable (any corner), collapsible mini-viewer that overlays a main view with a whole floor plan and a blue capture walk of ordered `points` (fractions of the plan). Minimizes to a map-icon button and fires `onPointSelect` when a point is clicked. Ships `FloorPlan` / `captureRouteForFloor` / `BASE_CAPTURE_ROUTE` demo helpers and the `CapturePoint` type.
- 517bf13: add AddClinicVisitDialog — dialog form for recording a clinic visit for a worker or visitor
- 517bf13: Add `CompareBars` — the dual-bar comparison primitive (two hero percentages + variance pill + legend + stacked bars). `ProgressComparison` now composes it for its hero block (unchanged output), so the bars can be used standalone.
- 517bf13: Add `MilestoneTable` — a collapsible milestones table (swatch + id, actual date or “—”, planned date) with zebra striping. Complements `ProgressComparison`'s milestone stepper when the exact dates matter.
- 517bf13: Add `OperationsDrawer` — a drawer for reviewing and editing the operations under a single object. The header carries the object identifier, its WBS path, an overall progress bar, and a walkthrough link; a compact table lists each operation with its WT / PREV / BAC / EV metrics and an editable progress field; the footer discards or saves the changes. Composed from Table, Progress, Input, and Button.
- 517bf13: Add the `ProgressDetails` page template (`@wakecap/core-ui/pages/core-progress-details`) — a period-based progress-details workspace over a WBS: a three-bar header (tab switcher + week/period selector; period status + approval counters + Import / Close-Period; search + sort + filter), a searchable WBS Navigator sidebar, and a content list that drills zone → category → division → task → object. Rows are `ProgressListItem`; clicking an object opens the `OperationsDrawer` to edit its operations' progress. The breadcrumb collapses responsively.
- 517bf13: Add `ProgressListItem` — the shared row for a progress-details list. One component covers every WBS level via the `variant` prop: `generic` (a zone/category/division grouping — an EV rollup + tool count, no progress bar), `task` (a work item — name/code + schedule badge, EV strip, and a progress bar), and `object` (a physical object under a task — name/code + metrics + a progress bar). Every variant stacks the name over its code; the props you pass (badge, metrics, progress, tools) decide what renders. Rows with an `onOpen` handler render as buttons that drill into the next level. Built on Badge and Progress.
- 517bf13: Add `WalkthroughModal` — a large, edge-to-edge `MapCompareLayout` (with the session timeline) shown in a dialog with a single compact 14px title and no subtitle. Opened from a capture point or a blueprint walk-through button to compare that capture against another session.
- 517bf13: Add three workspace page templates: `@wakecap/core-ui/pages/core-blueprint-viewer` (BlueprintViewer), `@wakecap/core-ui/pages/core-blueprint-navigator` (BlueprintNavigator), and `@wakecap/core-ui/pages/core-map-compare-layout` (MapCompareLayout), each with a template manifest and a Storybook Templates story.

  Remove the `CanvasWorkspaceLayout` component (`@wakecap/core-ui/canvas-workspace-layout`) — it was an outdated layout shell and is superseded by the self-contained Blueprint Navigator template.

- 517bf13: Unify analytics surfaces and control sizing.

  **Tokens**

  - Corner radius collapsed to a flat 4px across the scale (`rounded-full` untouched). The unsuffixed `rounded`/`rounded-t`/`rounded-b` utilities are pulled back onto the token, and the TW3 preset matches.
  - Dark mode moves off near-black (`#0a0a0a`) to a warm charcoal canvas (`#141210`), with a monotonic surface ladder: sidebar < canvas < card < muted < border. `--muted` now steps clearly above `--card` so header bands are visible in dark mode.
  - New `--shadow-surface` token — the one sanctioned lift for analytics surfaces, since the generic `shadow-*` utilities are disabled by the minimal theme.

  **Components**

  - New `WidgetCard` — the shared analytics shell (grey header band + body) composed by `ChartContainer`, `TrendChart` and `MetricCard`. `ChartContainer` gains `title`, `actions` and `value`.
  - `Table` header rows use the same muted band, so tables and chart tiles read as one system.
  - `Button`: default size is now 32px (was 36px) to match the app's control height, and icon/label spacing is `gap-1.5` with no stacked margins.
  - `Tabs`: active state keys off `aria-selected` instead of `data-state`, which a wrapping tooltip could overwrite, and carries redundant cues so icon-only tabs read correctly.
  - `HoverTooltip` no longer clobbers the wrapped child's `data-state`.
  - `Empty` is borderless — no dashed placeholder frame.
  - `CoreAppSidebar`: border only on the right edge (fixes a 1px misalignment with the top bar), and the collapsed rail's avatar opens the same profile menu as the expanded footer.

- 517bf13: Add an `onWalkthrough` callback to `BlueprintViewer3` (`core-blueprint-viewer-3`). Each blueprint segment's walk-through button now fires `onWalkthrough(floor)` with the floor's `{id, label, name, value}`, so a host can open its own walk-through UI (e.g. a compare modal). Also exports the `BlueprintViewer3Props` and `BlueprintViewer3WalkthroughFloor` types.
- 517bf13: feat(ui): make BreadcrumbEllipsis an interactive dropdown

  `BreadcrumbEllipsis` now accepts an `items` prop (the collapsed middle levels). When provided, the "…" becomes a button that opens a `DropdownMenu` (the same primitive the toolbar action menus use) listing those levels as links or actions. Without `items` it stays a static, decorative ellipsis. Useful for collapsing a deep trail (more than four levels) to the first + last level with everything in between behind the ellipsis. Exports a `BreadcrumbMenuItem` type.

- 517bf13: Add a `collapseIcon` prop to `CanvasNavigator`. Overrides the header's collapse control icon (default chevron-up) — useful when the navigator is docked as a sidebar and "collapse" should read as "hide the panel" (e.g. a panel/sidebar icon). Defaults to the existing chevron-up.
- 517bf13: feat(ui): add a `compact` prop to CanvasNavigator

  `compact` renders a denser panel with 12px text (vs 14px) on the tree rows,
  header title, search field, and breadcrumb search results, plus a shorter search
  header — for tight sidebars and canvas overlays.

- 517bf13: feat(ui): CanvasNavigator deep-tree shift, all-level view hint, and selectable second-last level

  `CanvasNavigator` gains a `shiftAfterLevel` prop: once branches open past that (1-based) level, the default tree slides left by one indent step — the gap between level 1 and level 2 — for every level revealed beyond it, keeping very deep paths (6+ levels) in view, and shifts back as levels collapse. The hover "view" hint now appears on every row (all branch levels and the expanded "go big" tree), not just the lowest level and search results. The second-last level (a branch whose children are leaves) is now selectable like the upper branch levels — clicking the row body (or the "view" hint) selects it, while the chevron / label expands it in place.

- 517bf13: `CanvasNavigator`: add an `expandable` prop (default `true`). Set it to `false` to hide the header's expand ("go big") control while keeping the collapse control.
- 517bf13: feat(ui): CanvasNavigator loading bar + search-result "view" hover hint

  - Add `loading` / `loadingLabel` props that dock a spinner bar to the bottom of
    the panel while locations stream in.
  - Search results now show the same "view" hover hint as the tree's lowest-level
    rows, revealed on row hover.

- 517bf13: CanvasNavigator: the `searchable` variant now renders the search field as the header (search icon + input, with the size controls on the right) instead of a separate bar below the title. Selection is now uncontrolled-capable via a new `defaultValue` prop and defaults to the first (top-level) node, so the navigator always opens with the top level selected.
- 517bf13: feat(ui): CanvasNavigator search shows a flat breadcrumb result list

  While searching, the navigator now replaces the hierarchy with a flat list of
  matching locations. Each result is shown as its full path (e.g.
  `North Campus/Building A/Level 1/Zone A`) truncated from the start so it stays on
  one line and the location itself stays visible. Picking a result selects that
  location, jumps to it, and clears the query.

- 517bf13: feat(ui): add CanvasNavigator and a bare navigator slot for CanvasWorkspaceLayout

  Adds `CanvasNavigator` — a floating panel that navigates a hierarchy of **any depth** (a recursive `nodes` model where a node with `children` is a branch and a node without is a selectable leaf — e.g. Site → Building → Level → Zone) built on `TreeRow`, with single-select, expand/collapse, and a header that can **collapse** the panel to its title bar or **expand** it ("go big"). The default view shows the tree, expanding in place down through the branch levels to the deepest navigable level (a branch whose children are leaves). Drilling into that last level focuses on just its items and reveals a back button + the level name in the header; back returns to the tree. The expanded ("go big") view always shows the full tree, leaves included. Rows use a tighter 8px-per-level indent. Long names: a `truncate` variant (`"end"` adds a hover tooltip with the full name when clipped; `"middle"` keeps the start and the tail visible, e.g. for filenames; `"clamp"` middle-truncates each row to a single line while the **selected** row wraps to show its full name across up to `maxLines` lines — default 3 — with no horizontal scrolling) plus `tailChars`/`maxLines`, forwarded to `TreeRow` (which gains the same props, derives `selected` from its `variant`, and now constrains its label so the ellipsis renders correctly).

  Nodes are selectable by clicking the row body. On the second-lowest level (a branch whose children are leaves), the chevron expands its items in place, while clicking the label or empty space drills into the focused lowest-level view (pre-selecting its first enabled child). This relies on a new `labelTogglesExpand` prop on `TreeRow` that lets the label fall through to the row's `onClick` instead of toggling expansion. A branch with an empty `children: []` array shows no chevron in the tree and renders an empty state (text via `emptyLabel`) only when drilled into — e.g. a level that has nothing under it. Nodes render label-only when `icon` is omitted. When collapsed, the header becomes a compact stepper with prev/next arrows that page between the selected item's siblings (items in the same group), skipping disabled ones, and shows the current position and total count of items in that level (e.g. `1/3`). Adds a `bare` option to `CanvasWorkspaceLayout`'s navigator overlay slot so self-contained panels like `CanvasNavigator` can own their own chrome and collapse/expand behavior instead of the layout's default dock header.

- 517bf13: feat(ui): add a `stat` variant to Card

  `variant="stat"` renders a compact, flat white tile (medium radius, no shadow) for dense
  metric bars; the default variant is unchanged.

- 517bf13: add DataTableRowActions, AddClinicLocationDialog, and AssignDoctorDialog; give Clinic settings four panes (Visit Frequency, Age-Based Rules, Clinics, Doctors)
- 517bf13: add Clinic template — occupational-health app shell with Overview and Worker Fitness tabs plus a Settings sub-surface
- 517bf13: feat(ui): add CompareView

  A component for comparing two geo-aligned sources (e.g. as-planned vs. as-built, or yesterday vs. today). `mode="swipe"` (default) stacks the two and reveals more of one as you drag a center divider — grab the handle, click anywhere on the divider, or focus it and use ←/→ (keyboard-accessible via `role="slider"`); `mode="side-by-side"` splits the box into two panes showing both in full. Takes any nodes (images, maps, canvases) for `before`/`after`, supports controlled/uncontrolled divider `position`, `onPositionChange`, and optional `beforeLabel`/`afterLabel` chips. Exported as `@wakecap/core-ui/compare-view`.

  With `interactive`, the content pans (drag) and zooms (wheel) — the two sources stay geo-aligned — and in side-by-side a **lock** on the dividing line keeps both panes in the same coordinates (drag/zoom together); unlock to move them independently. Tune with `defaultScale`, `minScale`/`maxScale`, and controlled `locked`/`onLockedChange`.

  Also wired into the Map Toolbar demo: picking a compare mode from the split button's hover menu now overlays the two captures on the map, pannable and zoomable.

- 517bf13: feat(ui): add server-driven mode to DataTable

  `DataTable` gains an opt-in manual mode for lists too large to fetch at once: `manualPagination`,
  `rowCount`, controlled `pagination`/`onPaginationChange`, `manualSorting`, controlled
  `sorting`/`onSortingChange`, controlled `search`/`onSearchChange`, `isLoading` (skeleton rows), and
  `emptyMessage`. All are optional — omitting them keeps today's client-side behavior unchanged.

  Also adds `getRowId`. Without it TanStack falls back to the row index, so bulk-action selection keys
  collide across server-fetched pages; pass it whenever `manualPagination` is on.

  Fixes the empty-state cell spanning the raw column count instead of the visible column count, which
  was wrong whenever columns were hidden via the column toggle.

- 517bf13: add a `unified` variant to DateTimePicker — one trigger with calendar, time, and Cancel/Apply in the popover; tighten add-dialog sections to uppercase headers without descriptions
- 517bf13: add TimePicker (replaces native `<input type="time">`); dialogs now validate on submit instead of disabling the action, drop header descriptions, adopt the widget-card header band, and use a blurred rather than dark modal scrim
- 517bf13: feat(ui): add FormActionBar — sticky page-level form footer

  New `@wakecap/core-ui/form-action-bar` export. Left-aligned `status` slot, right-aligned actions as
  children, and it owns its own full-bleed background, top border, and upward shadow. Render it as a
  sibling of the padded content container rather than a child, so it never needs negative margins to
  cancel shell padding. `sticky={false}` opts into normal flow.

  The AdminPanel template's hand-rolled save bar now uses it.

- 517bf13: feat(ui): add FragmentViewer and a stage slot on the Site Reality template

  `FragmentViewer` (`@wakecap/core-ui/fragment-viewer`) renders a That Open Fragments (`.frag`) model
  with orbit, zoom and click-to-select, reporting the picked element back to React. It wraps `three` +
  `@thatopen/fragments` — the same runtime the WC3 engineering viewers use — behind the effect-mounted
  pattern already used by `Map`.

  Both libraries are declared as **optional** `peerDependencies`, so only apps that import the widget
  install them (~900 KB). Add them to your app alongside `@wakecap/core-ui`:

  ```bash
  pnpm add three@^0.182.0 @thatopen/fragments@~3.4.6
  ```

  The widget needs a `workerUrl` prop — a bundled library cannot resolve
  `@thatopen/fragments/worker` to a runtime URL. In a Vite app:

  ```tsx
  import workerUrl from "@thatopen/fragments/worker?url";

  <FragmentViewer src="/models/vd2.frag" workerUrl={workerUrl} />;
  ```

  `SiteReality` gains two optional slots — `stage` (fills the map area) and `contextHeader` (top of the
  context column) — so an engine can be injected without the template taking a rendering dependency.
  Both default to empty, so existing usage is unchanged.

- 517bf13: feat(ui): add Legend component

  A compact, generic key that maps swatch colors to labels. Floats over a canvas/map (`placement` bottom-right by default) or embeds inline (`placement="static"`), and can minimize to a small reopen button (controlled/uncontrolled `collapsed`). Supports square or circle swatches, 1–3 columns, per-item `color`/`borderColor`/`opacity` (arbitrary CSS colors), optional `status` text, per-item `description`, and a `footnote`. Exported as `@wakecap/core-ui/legend`.

  Also adds a `TabbedLegend` variant from the same entry: a collapsible header ("view mode") over WakeCore `Tabs`, where each tab (`LegendTab`) swaps in its own colors and rows to re-key the legend based on what's selected. Tab content caps at `maxRows` (default 4) and overflows into extra columns, so it grows horizontally instead of getting tall.

- 517bf13: feat(ui): per-pane minimaps and toolbars when the compare divider is unlocked

  `MapCompareLayout` now gives each pane its own controls while side-by-side
  compare has the divider unlocked (panes pan/zoom independently):

  - A second overview minimap appears bottom-left for the before pane; the
    bottom-right overview tracks the after pane. Both are labelled "Overview".
  - A second map toolbar (locate / zoom / compass) appears at the top-left for the
    before pane; the top-right toolbar drops the compare-mode control (which moves
    to the before-pane toolbar) and drives the after pane on its own.
  - The legend yields the bottom-left corner while the second minimap is shown.

  When the panes are synced (or not side-by-side) a single overview and toolbar
  track the shared view, as before.

  To support this, `CompareView` gained an `onViewChangeAfter` prop (reports the
  after pane's visible region in side-by-side) and `setCenterAfter` / `zoomByAfter`
  on its `CompareViewApi` for driving the after pane independently.

- 517bf13: feat(ui): MapToolbar / MapCompareLayout — exit compare view from the compare menu

  `MapToolbar` gains an `onExitCompare` prop: once a compare mode is active, the split-view (compare-mode) hover menu shows an "Exit compare view" row (under a divider) that leaves compare. `MapCompareLayout` wires it into both toolbars (the primary top-right one and the unlocked side-by-side before-pane), clearing the active mode and resetting the divider to locked so the next compare session starts synced.

- 517bf13: feat(ui): add MapCompareLayout — a map workspace composing the map features

  `MapCompareLayout` assembles the map building blocks into one floating-control workspace: a pannable/zoomable `CompareView` surface with an optional as-planned/as-built compare, a vertical `MapToolbar` (compare modes, locate, zoom, compass) top-right, an overview `MapMinimap` bottom-right that tracks and drives the view, and optional `legend` / `title` slots. It manages the shared state (compare mode, view, bearing) internally; pass `map` (and optional `compareMap`) plus slots. Exported as `@wakecap/core-ui/map-compare-layout`.

  Supporting changes to `CompareView`: `after` is now optional (omit it for a single pan/zoom map), and the `viewControllerRef` gains `zoomBy(factor)` so the toolbar's ± buttons drive the map zoom.

- 517bf13: feat(ui): add MapMinimap + CompareView view reporting/navigation

  `MapMinimap` is an overview control: a header (`label` above, optional `minimizable` toggle on the right that collapses it to just the header) over a thumbnail of the whole map with a box marking the region the main view is currently showing (the area outside the box is dimmed). Pass the current `viewport` as fractions (0–1) of the full map; with `onNavigate`, dragging or clicking the preview recenters the view. Exported as `@wakecap/core-ui/map-minimap`.

  `CompareView` now reports its visible region via `onViewChange` and accepts an imperative `viewControllerRef` (`.setCenter(x, y)`), so a `MapMinimap` can track the compare view **and** drive it — drag the minimap to pan the underlying map.

- 517bf13: feat(ui): add MapToolbar and MapCompass

  `MapToolbar` is a vertical floating toolbar for a map: a split-view toggle, a "my location" button, zoom (via `VerticalZoomTools`), and a compass — each rendered as its own pill in the shared vertical-zoom-tools style, with the compass a **separate pill below** the zoom control. Every section is optional and appears only when its handler is provided (`onSplitViewChange`, `onLocate`, `onZoomIn`/`onZoomOut`, `onResetNorth`), so the toolbar grows with the features you wire up.

  `MapCompass` is the standalone compass-realignment control it uses: a two-tone needle (red north / slate south) that counter-rotates with the map `bearing` to keep pointing north and calls `onResetNorth` when pressed. Like `VerticalZoomTools` it takes a `variant` (`"default"` | `"bare"`) so it can float on its own or nest inside a larger vertical toolbar. Exported as `@wakecap/core-ui/map-toolbar` and `@wakecap/core-ui/map-compass`.

  Every button in `MapToolbar`, `VerticalZoomTools`, and `MapCompass` shows a `Tooltip` on hover/focus (positioned to the left) naming what it does.

  The split-view control is a compare-mode picker: hovering its button opens a `HoverCard` menu of the two modes — **Side-by-side** (two panes at once) and **Swipe** (a draggable reveal divider) — each with a short description. Driven by `splitMode` (`"side-by-side" | "swipe" | null`) and `onSplitModeChange`; the exported `SplitMode` type replaces the previous boolean `splitView`/`onSplitViewChange` API. The hover menu is self-describing, so this button has no tooltip.

- 517bf13: Add MapViewNav — two individual floating previous / next buttons (the same pill + `ToolbarButton` as the rest of the map toolbar) for stepping between map views. Intended to sit at the bottom-center of a map to page along a path, cycle layers, or switch sheets. Exported from `@wakecap/core-ui/map-toolbar` alongside `MapToolbar`.
- 517bf13: feat(ui): add MultiSelect — a searchable multi-select form field

  New `@wakecap/core-ui/multi-select` export. Combines Popover + Command + Checkbox with the
  selected options rendered as removable Badge pills below the field. Returns `string[]`, keeps the
  dropdown open while picking, supports an `invalid` state (`aria-invalid` + destructive border) for
  form validation, and filters on the option `label` so opaque ids can be used as values.

  The private `MultiSelect` helper inside the AdminPanel template now consumes this component.

- 517bf13: feat(ui): add ObjectDrawingToolbar

  A single-line horizontal toolbar for a 2D canvas drawing tool, composed entirely from WakeCore components: a mode toggle and drawing-tool group (select / line / circle / rectangle / polygon) built from `ToolbarButton`, fill and stroke color pickers (`ToolbarColorPicker`), an opacity `Slider`, a 90°-snap toggle, and unlink / import actions — divider-separated with `ToolbarSeparator`. Self-manages state with `onChange` callbacks (`onToolChange`, `onEditingChange`, `onFillColorChange`, `onStrokeColorChange`, `onOpacityChange`, `onAngleSnapChange`, `onUnlink`, `onImport`). Exported as `@wakecap/core-ui/object-drawing-toolbar`.

- 517bf13: add SectionHeader and AttentionList/AttentionListItem; give Progress semantic tone variants (primary/success/warning/danger)
- 517bf13: `ProgressComparison`: add a `collapsedSummary` prop that keeps a summary row (status chip + primary value) beneath the header when collapsed, plus a `defaultCollapsed` prop to start collapsed. The default width is now a fixed 288px card (`w-72`); pass a width class such as `wwc:w-full` to override.
- 517bf13: Add ProgressComparison component — a panel comparing two progress sources (e.g. actual vs. planned) with hero percentages, a variance pill, a combined bar, and an expandable stats grid. Variants: `progress` (status chip), `milestone` (stepper timeline), and `preview` (image preview + action button). Renders at a single compact density and fills its container (pass a width class such as `wwc:w-72` to fix it). Has a self-managing `collapsible` header button (or wire `onClose` to close a modal). `title` is optional — omit it to hide the title line when the name is already shown elsewhere. Designed to sit inside a modal.
- 517bf13: feat(ui): add `required` affordance to Label, FieldLabel, FormLabel and PropertyRow

  `required` appends a decorative (`aria-hidden`) destructive asterisk after the label text. Implemented
  on `Label`, so `FieldLabel` and `FormLabel` inherit it; `PropertyRow` gains the same prop for
  definition-list style forms. Also exports `RequiredMark` for custom label layouts.

  The asterisk is presentational only — mark the control itself `required` so assistive tech is told
  too. `FormControl` already forwards a native `required` to the underlying input.

- 517bf13: add RuleRow and RuleList — reorderable rule-builder primitives with reorder controls, a trailing meta slot, and delete
- 517bf13: add ScoreGauge (radial single-score dial) and ProgressStat (metric tile with a completion bar)
- 517bf13: feat(ui): keep the tab bar interactive in the collapsed TabbedLegend

  When a `TabbedLegend` is collapsed it now shows the tab bar plus an expand (+)
  button instead of a single chip. You can switch the active view while collapsed,
  and the selection persists when you expand to see the swatch grids again. The
  active tab is shared between the collapsed and expanded states.

- 517bf13: Add TimelineRangeSelector component — a compact, embeddable timeline that selects a date range via draggable handles over a day strip, with `bar`/`dot` variants and a period dropdown (all / 1y / 3m / 1m).
- 517bf13: feat(ui): add compact variant to TimestampPicker and Calendar

  `Calendar` now accepts a `size` prop (`"default" | "compact"`). The compact
  size shrinks day cells from 36×36px to 32×32px, nav buttons from 28px to
  24px, and reduces padding/spacing. Font sizes are unchanged from the default.

  `TimestampPicker` gains a `compact` boolean prop that drives the compact
  calendar and correspondingly tightens the trigger, date header, and time
  list spacing for dense layouts such as toolbars and side panels.

- 517bf13: feat(ui): show a "Latest" badge on TimestampPicker when the newest capture is selected

  When the selected value is the single most recent capture across all `entries`,
  the collapsed selector now shows a blue "Latest" badge next to the label. The
  badge clears automatically when any earlier timestamp is selected.

- 517bf13: feat(ui): add TimestampPicker component

  A pill-shaped selector for choosing a captured timestamp. The trigger shows the selected date + time (primary) and a subtitle (secondary) with a chevron. Clicking opens the standard calendar, where dates that have captured data are marked with a dot and dates without data are disabled. Selecting a date reveals a scrollable list of the times captured on that day, each with an optional label. Takes `entries: TimestampEntry[]` (`{ time: Date; label?: string }`), `value`, and `onChange`. Exported as `@wakecap/core-ui/timestamp-picker`.

- 517bf13: feat(ui): add ToolbarColorPicker

  A PowerPoint-style color control for toolbars: a `ToolbarButton` trigger that previews the current color (as a swatch, or as a bar beneath a passed `icon`) and opens a `Popover` with grouped swatches, a **No fill** option (value `""`), a Recent row that fills as custom colors are picked, and an OS color picker via **More colors…**. Controlled/uncontrolled `value`, configurable `groups`, `columns`, `allowNoColor`/`noColorLabel`, `allowCustom`/`customLabel`, and `recentColors`. A `preview` prop chooses how the color shows next to `icon`: `"bar"` (default, beneath the icon) or `"swatch"` (a square to the right). A `compact` prop drops all labels and text so the popover is just the swatch grid — no-fill is the first swatch and the OS picker is a color-wheel swatch at the end. On supporting (Chromium) browsers an eyedropper button (native `EyeDropper` API) lets you sample any pixel on screen; it's feature-detected and hidden where unavailable. Exported as `@wakecap/core-ui/toolbar-color-picker`.

- 517bf13: feat(ui): add Toolbar primitives and break CanvasToolbar into composable parts

  Introduces a `Toolbar` primitive family (`Toolbar`, `ToolbarButton`, `ToolbarSeparator`, `ToolbarGroup`, `ToolbarMenuButton`) and extracts the canvas toolbar's sections into standalone components: `CanvasFilePicker` (the file/drawing selector) and `ToolbarPager` (compact prev/next pager). `ToolbarMenuButton` is a generic dropdown-button (single-select picker or plain action menu) extracted from the shape/line/pin pickers in `DrawingActions`. `DrawingActions` and `ZoomTools` are refactored to compose the new primitives, and `CanvasToolbar` is rebuilt on top of all of them. Public APIs of `CanvasToolbar`, `DrawingActions`, and `ZoomTools` are unchanged.

- 517bf13: feat(ui): add ToolbarStats component

  A full-width toolbar of labeled metric tiles (caption over a bold value). `groups`
  splits the row into divider-separated sections; values flagged `negative` render in
  the destructive color. `variant="cards"` (default) draws separate bordered tiles on
  the Card `stat` variant; `variant="table"` draws a bare row of full-height cells split
  by full-height internal dividers (no outer outline).

- 517bf13: feat(ui): add VerticalZoomTools and make Toolbar orientation-aware

  A compact vertical zoom control (Zoom In over Zoom Out) intended to float over a map or canvas — the vertical counterpart to `ZoomTools`. Controlled/uncontrolled via `zoomLevel`/`onZoomIn`/`onZoomOut` with auto-derived enabled state (`minZoom`/`maxZoom`, overridable with `canZoomIn`/`canZoomOut`), and a `variant` (`"default"` | `"bare"`) so it can be the first section of a larger vertical floating toolbar. Exported as `@wakecap/core-ui/vertical-zoom-tools`.

  The `Toolbar` primitive gains an `orientation` prop (`"horizontal"` default | `"vertical"`) — a vertical toolbar lays items in a column and sets `aria-orientation` — and `ToolbarSeparator` gains a matching `orientation` prop (`"vertical"` default | `"horizontal"`) to render a rule across a vertical toolbar. Existing horizontal usage is unchanged.

- 517bf13: Add a `segmented` variant to `ViewTabBar` — a full-width toolbar that heads the content below it. It renders a pill view-switcher on the left (a muted rounded container with a filled/white active segment) and, on the right, an optional built-in `weekSelector` (period navigation, rendered `bare`) and a `trailing` slot for extra actions. The view switcher and period selector are paired frequently, so this variant composes them together. `variant="underline"` (default) is unchanged.
- 517bf13: Add a `bare` prop to `WeekSelector`. When set, the control drops its default outer container (rounded corners, border, card background, and padding) so it sits flush inside a toolbar or app bar. The inner layout — date-range label, prev/next chevrons, and week tabs — is unchanged. Defaults to `false`.
- 517bf13: feat(ui): WeekSelector defaults the uncontrolled selection to the latest week

  The uncontrolled default selection is now the latest (last) week instead of the
  middle one. Pass `defaultValue` to override. `visibleCount` defaults to 4.

- 517bf13: Add WeekSelector — a compact week picker with a clickable date-range label that opens a calendar (jump to any week), previous / next chevrons that step the selected week while keeping it centered in the tabs, and a segmented row of week tabs built on the shared `Tabs` component. Controlled or uncontrolled via `value` / `defaultValue`.
- 517bf13: feat(ui): show a zoom percentage in ZoomTools

  `ZoomTools` now shows the current zoom level as an **editable percentage** between the zoom-out and zoom-in buttons (container-less, derived from `zoomLevel`). Type a value and press Enter (or blur) to set the zoom: pass `onZoomChange(zoomLevel)` to receive the new multiplier (clamped to `minZoom`/`maxZoom`); without it the field is read-only. Use `showPercentage={false}` to hide it. Adds a `variant` prop — `variant="bare"` drops the bordered toolbar surface so ZoomTools can be embedded inside other chrome (e.g. a view header) without drawing its own container. **Redesigned as a single unified control** — zoom-out · percentage · zoom-in · Fit grouped in one container with no separators and a flat (borderless) Fit button. Removes the Scale button and its `scaleLabel`/`onScale` props.

### Patch Changes

- 517bf13: fix(ui): add gap-1 to Badge so a leading icon no longer touches its label
- 517bf13: `BlueprintViewer3` now composes the shared components (`MetricBar`, `CompareBars`, `MilestoneTable`, `BlueprintSegment`) instead of hand-rolling those blocks — same rendered output. `BlueprintSegment` gains `bare` (drop the card frame for a seamless split grid) and `labelClassName` (offset the label chip).
- 517bf13: style(ui): left-align the CanvasNavigator collapsed-view label

  The collapsed stepper's label now aligns left (was centered) between the prev/next
  controls.

- 517bf13: `CanvasNavigator`: the collapsed view is now a segmented bar — a back button (up to the parent level) alongside the sibling pager and expand control, with dividers between each segment.
- 517bf13: style(ui): make the CanvasNavigator background white

  The panel now uses a white background (`bg-white`) instead of the `card` token.

- 517bf13: add a fixed `--radius-control` (4px) for small controls, and pin the checkbox, MultiSelect indicator, and colour swatches to it so the 8px base radius no longer rounds them into circles
- 517bf13: fix(ui): add gap-2 to DropdownMenuItem and DropdownMenuSubTrigger so leading icons no longer touch their label
- 517bf13: style(ui): set Legend text to 14px

  Bump all Legend / TabbedLegend text (labels, descriptions, status, footnotes,
  tab triggers, collapsed bar) to 14px (`text-sm`).

- 517bf13: Use chevron icons for the collapse/expand toggle on `Legend`/`TabbedLegend` and `ProgressComparison` (replacing the minus/plus icons).
- 517bf13: `Legend` / `TabbedLegend`: use `rounded-lg` corners (matching the canvas navigator). `TabbedLegend` keeps underline tabs when expanded, but drops the underline (list border + active indicator) when collapsed — the active view reads via its bold label instead.
- 517bf13: fix(ui): position MapCompareLayout per-view controls at the top center

  `mapCenter` / `compareMapCenter` slots now sit at the top center of each
  source (`top-3`) instead of the vertical middle, so floating controls like a
  `TimestampPicker` don't cover the center of the map.

- 517bf13: bump the corner radius token from 4px to 8px; align date-picker triggers to the 36px form-control height so they sit level with Input and Select
- 517bf13: `TabbedLegend` no longer shrinks when expanded — the expanded tab row now reserves the same trailing space as the collapsed view's toggle button, so the panel stays at least as wide as its collapsed state.
- 517bf13: fix(ui): TaskMonitor now forwards each item's `icon` onto its open browser tab (was dropped)
- 517bf13: fix(ui): snap TimelineRangeSelector handles to day marks

  Handles are now positioned at the center of each day's cell — where the dot/bar
  is drawn — and dragging hit-tests to the day whose cell sits under the pointer.
  Previously handles used an edge-to-edge model that didn't line up with the
  centered marks, so a dragged handle could land in the gap between days instead
  of on a day.

- 517bf13: style(ui): tighten WeekSelector spacing

  Reduce the gap between elements to 4px, the container padding to 12px/8px, and
  the date-button icon/label gap to 4px for a more compact control.

- Updated dependencies [517bf13]
- Updated dependencies [517bf13]
- Updated dependencies [517bf13]
  - @wakecap/core-tokens@0.4.0

## 0.6.0

### Minor Changes

- baf14ee: Unify analytics surfaces and control sizing.

  **Tokens**

  - Corner radius collapsed to a flat 4px across the scale (`rounded-full` untouched). The unsuffixed `rounded`/`rounded-t`/`rounded-b` utilities are pulled back onto the token, and the TW3 preset matches.
  - Dark mode moves off near-black (`#0a0a0a`) to a warm charcoal canvas (`#141210`), with a monotonic surface ladder: sidebar < canvas < card < muted < border. `--muted` now steps clearly above `--card` so header bands are visible in dark mode.
  - New `--shadow-surface` token — the one sanctioned lift for analytics surfaces, since the generic `shadow-*` utilities are disabled by the minimal theme.

  **Components**

  - New `WidgetCard` — the shared analytics shell (grey header band + body) composed by `ChartContainer`, `TrendChart` and `MetricCard`. `ChartContainer` gains `title`, `actions` and `value`.
  - `Table` header rows use the same muted band, so tables and chart tiles read as one system.
  - `Button`: default size is now 32px (was 36px) to match the app's control height, and icon/label spacing is `gap-1.5` with no stacked margins.
  - `Tabs`: active state keys off `aria-selected` instead of `data-state`, which a wrapping tooltip could overwrite, and carries redundant cues so icon-only tabs read correctly.
  - `HoverTooltip` no longer clobbers the wrapped child's `data-state`.
  - `Empty` is borderless — no dashed placeholder frame.
  - `CoreAppSidebar`: border only on the right edge (fixes a 1px misalignment with the top bar), and the collapsed rail's avatar opens the same profile menu as the expanded footer.

- baf14ee: feat(ui): add server-driven mode to DataTable

  `DataTable` gains an opt-in manual mode for lists too large to fetch at once: `manualPagination`,
  `rowCount`, controlled `pagination`/`onPaginationChange`, `manualSorting`, controlled
  `sorting`/`onSortingChange`, controlled `search`/`onSearchChange`, `isLoading` (skeleton rows), and
  `emptyMessage`. All are optional — omitting them keeps today's client-side behavior unchanged.

  Also adds `getRowId`. Without it TanStack falls back to the row index, so bulk-action selection keys
  collide across server-fetched pages; pass it whenever `manualPagination` is on.

  Fixes the empty-state cell spanning the raw column count instead of the visible column count, which
  was wrong whenever columns were hidden via the column toggle.

- baf14ee: feat(ui): add FormActionBar — sticky page-level form footer

  New `@wakecap/core-ui/form-action-bar` export. Left-aligned `status` slot, right-aligned actions as
  children, and it owns its own full-bleed background, top border, and upward shadow. Render it as a
  sibling of the padded content container rather than a child, so it never needs negative margins to
  cancel shell padding. `sticky={false}` opts into normal flow.

  The AdminPanel template's hand-rolled save bar now uses it.

- baf14ee: feat(ui): add MultiSelect — a searchable multi-select form field

  New `@wakecap/core-ui/multi-select` export. Combines Popover + Command + Checkbox with the
  selected options rendered as removable Badge pills below the field. Returns `string[]`, keeps the
  dropdown open while picking, supports an `invalid` state (`aria-invalid` + destructive border) for
  form validation, and filters on the option `label` so opaque ids can be used as values.

  The private `MultiSelect` helper inside the AdminPanel template now consumes this component.

- baf14ee: feat(ui): add `required` affordance to Label, FieldLabel, FormLabel and PropertyRow

  `required` appends a decorative (`aria-hidden`) destructive asterisk after the label text. Implemented
  on `Label`, so `FieldLabel` and `FormLabel` inherit it; `PropertyRow` gains the same prop for
  definition-list style forms. Also exports `RequiredMark` for custom label layouts.

  The asterisk is presentational only — mark the control itself `required` so assistive tech is told
  too. `FormControl` already forwards a native `required` to the underlying input.

- cf5c258: Add `AddObservationDialog`, a shared `MAPBOX_TOKEN` module, and a hover-only `HoverTooltip`.

  - `@wakecap/core-ui/add-observation-dialog` — dialog form for logging a safety observation
    (zone, category, description, attachments, worker, permit, date, stop-work notice).
  - `@wakecap/core-ui/mapbox-token` — single source of truth for the Mapbox access token, replacing
    five hardcoded copies across `map`, `map-controls`, and the org page templates.
  - `HoverTooltip` (from `@wakecap/core-ui/tooltip`) — tooltip driven by hover and `:focus-visible`
    only. The default Radix trigger also opens on programmatic focus, so hints reappeared and stuck
    when a Dialog or Popover restored focus to the icon button that opened it. Every icon-button
    surface now routes through it. `TooltipContent` also gained a `max-w-[220px]` cap so long labels
    wrap instead of stretching.

### Patch Changes

- Updated dependencies [baf14ee]
  - @wakecap/core-tokens@0.3.0

## 0.5.0

### Minor Changes

- 8cc6743: feat(ui): CoreAppSidebar footer accepts `user` and `onLogout`

  The sidebar footer no longer hardcodes the signed-in user. Pass `user={{ name, email?, avatarUrl? }}`
  to drive the profile bar (expanded drawer, collapsed rail, and account menu); `avatarUrl` renders via
  `AvatarImage` with initials/gradient fallback. Pass `onLogout` to wire the previously-inert "Log Out"
  item. Both are optional — when omitted the prior placeholder/behavior is unchanged. Closes #138.

## 0.4.0

### Minor Changes

- b7d6bac: Add `BuildingProgress` component — a building elevation progress stack. One row per floor (ordered top → bottom) shows a completion bar and percentage, tapering wider toward the base like a building silhouette. The `activeId` floor is highlighted; pass `onFloorSelect` to make the rows interactive. Supports `default` / `compact` sizes and a configurable `taperStep`.
- b7d6bac: Add three workspace page templates: `@wakecap/core-ui/pages/core-blueprint-viewer` (BlueprintViewer), `@wakecap/core-ui/pages/core-blueprint-navigator` (BlueprintNavigator), and `@wakecap/core-ui/pages/core-map-compare-layout` (MapCompareLayout), each with a template manifest and a Storybook Templates story.

  Remove the `CanvasWorkspaceLayout` component (`@wakecap/core-ui/canvas-workspace-layout`) — it was an outdated layout shell and is superseded by the self-contained Blueprint Navigator template.

- b7d6bac: feat(ui): make BreadcrumbEllipsis an interactive dropdown

  `BreadcrumbEllipsis` now accepts an `items` prop (the collapsed middle levels). When provided, the "…" becomes a button that opens a `DropdownMenu` (the same primitive the toolbar action menus use) listing those levels as links or actions. Without `items` it stays a static, decorative ellipsis. Useful for collapsing a deep trail (more than four levels) to the first + last level with everything in between behind the ellipsis. Exports a `BreadcrumbMenuItem` type.

- b7d6bac: feat(ui): add a `compact` prop to CanvasNavigator

  `compact` renders a denser panel with 12px text (vs 14px) on the tree rows,
  header title, search field, and breadcrumb search results, plus a shorter search
  header — for tight sidebars and canvas overlays.

- b7d6bac: `CanvasNavigator`: add an `expandable` prop (default `true`). Set it to `false` to hide the header's expand ("go big") control while keeping the collapse control.
- b7d6bac: feat(ui): CanvasNavigator loading bar + search-result "view" hover hint

  - Add `loading` / `loadingLabel` props that dock a spinner bar to the bottom of
    the panel while locations stream in.
  - Search results now show the same "view" hover hint as the tree's lowest-level
    rows, revealed on row hover.

- b7d6bac: CanvasNavigator: the `searchable` variant now renders the search field as the header (search icon + input, with the size controls on the right) instead of a separate bar below the title. Selection is now uncontrolled-capable via a new `defaultValue` prop and defaults to the first (top-level) node, so the navigator always opens with the top level selected.
- b7d6bac: feat(ui): CanvasNavigator search shows a flat breadcrumb result list

  While searching, the navigator now replaces the hierarchy with a flat list of
  matching locations. Each result is shown as its full path (e.g.
  `North Campus/Building A/Level 1/Zone A`) truncated from the start so it stays on
  one line and the location itself stays visible. Picking a result selects that
  location, jumps to it, and clears the query.

- b7d6bac: feat(ui): add CanvasNavigator and a bare navigator slot for CanvasWorkspaceLayout

  Adds `CanvasNavigator` — a floating panel that navigates a hierarchy of **any depth** (a recursive `nodes` model where a node with `children` is a branch and a node without is a selectable leaf — e.g. Site → Building → Level → Zone) built on `TreeRow`, with single-select, expand/collapse, and a header that can **collapse** the panel to its title bar or **expand** it ("go big"). The default view shows the tree, expanding in place down through the branch levels to the deepest navigable level (a branch whose children are leaves). Drilling into that last level focuses on just its items and reveals a back button + the level name in the header; back returns to the tree. The expanded ("go big") view always shows the full tree, leaves included. Rows use a tighter 8px-per-level indent. Long names: a `truncate` variant (`"end"` adds a hover tooltip with the full name when clipped; `"middle"` keeps the start and the tail visible, e.g. for filenames; `"clamp"` middle-truncates each row to a single line while the **selected** row wraps to show its full name across up to `maxLines` lines — default 3 — with no horizontal scrolling) plus `tailChars`/`maxLines`, forwarded to `TreeRow` (which gains the same props, derives `selected` from its `variant`, and now constrains its label so the ellipsis renders correctly).

  Nodes are selectable by clicking the row body. On the second-lowest level (a branch whose children are leaves), the chevron expands its items in place, while clicking the label or empty space drills into the focused lowest-level view (pre-selecting its first enabled child). This relies on a new `labelTogglesExpand` prop on `TreeRow` that lets the label fall through to the row's `onClick` instead of toggling expansion. A branch with an empty `children: []` array shows no chevron in the tree and renders an empty state (text via `emptyLabel`) only when drilled into — e.g. a level that has nothing under it. Nodes render label-only when `icon` is omitted. When collapsed, the header becomes a compact stepper with prev/next arrows that page between the selected item's siblings (items in the same group), skipping disabled ones, and shows the current position and total count of items in that level (e.g. `1/3`). Adds a `bare` option to `CanvasWorkspaceLayout`'s navigator overlay slot so self-contained panels like `CanvasNavigator` can own their own chrome and collapse/expand behavior instead of the layout's default dock header.

- b7d6bac: feat(ui): add a `stat` variant to Card

  `variant="stat"` renders a compact, flat white tile (medium radius, no shadow) for dense
  metric bars; the default variant is unchanged.

- b7d6bac: feat(ui): add CompareView

  A component for comparing two geo-aligned sources (e.g. as-planned vs. as-built, or yesterday vs. today). `mode="swipe"` (default) stacks the two and reveals more of one as you drag a center divider — grab the handle, click anywhere on the divider, or focus it and use ←/→ (keyboard-accessible via `role="slider"`); `mode="side-by-side"` splits the box into two panes showing both in full. Takes any nodes (images, maps, canvases) for `before`/`after`, supports controlled/uncontrolled divider `position`, `onPositionChange`, and optional `beforeLabel`/`afterLabel` chips. Exported as `@wakecap/core-ui/compare-view`.

  With `interactive`, the content pans (drag) and zooms (wheel) — the two sources stay geo-aligned — and in side-by-side a **lock** on the dividing line keeps both panes in the same coordinates (drag/zoom together); unlock to move them independently. Tune with `defaultScale`, `minScale`/`maxScale`, and controlled `locked`/`onLockedChange`.

  Also wired into the Map Toolbar demo: picking a compare mode from the split button's hover menu now overlays the two captures on the map, pannable and zoomable.

- b7d6bac: feat(ui): add Legend component

  A compact, generic key that maps swatch colors to labels. Floats over a canvas/map (`placement` bottom-right by default) or embeds inline (`placement="static"`), and can minimize to a small reopen button (controlled/uncontrolled `collapsed`). Supports square or circle swatches, 1–3 columns, per-item `color`/`borderColor`/`opacity` (arbitrary CSS colors), optional `status` text, per-item `description`, and a `footnote`. Exported as `@wakecap/core-ui/legend`.

  Also adds a `TabbedLegend` variant from the same entry: a collapsible header ("view mode") over WakeCore `Tabs`, where each tab (`LegendTab`) swaps in its own colors and rows to re-key the legend based on what's selected. Tab content caps at `maxRows` (default 4) and overflows into extra columns, so it grows horizontally instead of getting tall.

- b7d6bac: feat(ui): per-pane minimaps and toolbars when the compare divider is unlocked

  `MapCompareLayout` now gives each pane its own controls while side-by-side
  compare has the divider unlocked (panes pan/zoom independently):

  - A second overview minimap appears bottom-left for the before pane; the
    bottom-right overview tracks the after pane. Both are labelled "Overview".
  - A second map toolbar (locate / zoom / compass) appears at the top-left for the
    before pane; the top-right toolbar drops the compare-mode control (which moves
    to the before-pane toolbar) and drives the after pane on its own.
  - The legend yields the bottom-left corner while the second minimap is shown.

  When the panes are synced (or not side-by-side) a single overview and toolbar
  track the shared view, as before.

  To support this, `CompareView` gained an `onViewChangeAfter` prop (reports the
  after pane's visible region in side-by-side) and `setCenterAfter` / `zoomByAfter`
  on its `CompareViewApi` for driving the after pane independently.

- b7d6bac: feat(ui): add MapCompareLayout — a map workspace composing the map features

  `MapCompareLayout` assembles the map building blocks into one floating-control workspace: a pannable/zoomable `CompareView` surface with an optional as-planned/as-built compare, a vertical `MapToolbar` (compare modes, locate, zoom, compass) top-right, an overview `MapMinimap` bottom-right that tracks and drives the view, and optional `legend` / `title` slots. It manages the shared state (compare mode, view, bearing) internally; pass `map` (and optional `compareMap`) plus slots. Exported as `@wakecap/core-ui/map-compare-layout`.

  Supporting changes to `CompareView`: `after` is now optional (omit it for a single pan/zoom map), and the `viewControllerRef` gains `zoomBy(factor)` so the toolbar's ± buttons drive the map zoom.

- b7d6bac: feat(ui): add MapMinimap + CompareView view reporting/navigation

  `MapMinimap` is an overview control: a header (`label` above, optional `minimizable` toggle on the right that collapses it to just the header) over a thumbnail of the whole map with a box marking the region the main view is currently showing (the area outside the box is dimmed). Pass the current `viewport` as fractions (0–1) of the full map; with `onNavigate`, dragging or clicking the preview recenters the view. Exported as `@wakecap/core-ui/map-minimap`.

  `CompareView` now reports its visible region via `onViewChange` and accepts an imperative `viewControllerRef` (`.setCenter(x, y)`), so a `MapMinimap` can track the compare view **and** drive it — drag the minimap to pan the underlying map.

- b7d6bac: feat(ui): add MapToolbar and MapCompass

  `MapToolbar` is a vertical floating toolbar for a map: a split-view toggle, a "my location" button, zoom (via `VerticalZoomTools`), and a compass — each rendered as its own pill in the shared vertical-zoom-tools style, with the compass a **separate pill below** the zoom control. Every section is optional and appears only when its handler is provided (`onSplitViewChange`, `onLocate`, `onZoomIn`/`onZoomOut`, `onResetNorth`), so the toolbar grows with the features you wire up.

  `MapCompass` is the standalone compass-realignment control it uses: a two-tone needle (red north / slate south) that counter-rotates with the map `bearing` to keep pointing north and calls `onResetNorth` when pressed. Like `VerticalZoomTools` it takes a `variant` (`"default"` | `"bare"`) so it can float on its own or nest inside a larger vertical toolbar. Exported as `@wakecap/core-ui/map-toolbar` and `@wakecap/core-ui/map-compass`.

  Every button in `MapToolbar`, `VerticalZoomTools`, and `MapCompass` shows a `Tooltip` on hover/focus (positioned to the left) naming what it does.

  The split-view control is a compare-mode picker: hovering its button opens a `HoverCard` menu of the two modes — **Side-by-side** (two panes at once) and **Swipe** (a draggable reveal divider) — each with a short description. Driven by `splitMode` (`"side-by-side" | "swipe" | null`) and `onSplitModeChange`; the exported `SplitMode` type replaces the previous boolean `splitView`/`onSplitViewChange` API. The hover menu is self-describing, so this button has no tooltip.

- b7d6bac: Add MapViewNav — two individual floating previous / next buttons (the same pill + `ToolbarButton` as the rest of the map toolbar) for stepping between map views. Intended to sit at the bottom-center of a map to page along a path, cycle layers, or switch sheets. Exported from `@wakecap/core-ui/map-toolbar` alongside `MapToolbar`.
- b7d6bac: feat(ui): add ObjectDrawingToolbar

  A single-line horizontal toolbar for a 2D canvas drawing tool, composed entirely from WakeCore components: a mode toggle and drawing-tool group (select / line / circle / rectangle / polygon) built from `ToolbarButton`, fill and stroke color pickers (`ToolbarColorPicker`), an opacity `Slider`, a 90°-snap toggle, and unlink / import actions — divider-separated with `ToolbarSeparator`. Self-manages state with `onChange` callbacks (`onToolChange`, `onEditingChange`, `onFillColorChange`, `onStrokeColorChange`, `onOpacityChange`, `onAngleSnapChange`, `onUnlink`, `onImport`). Exported as `@wakecap/core-ui/object-drawing-toolbar`.

- b7d6bac: `ProgressComparison`: add a `collapsedSummary` prop that keeps a summary row (status chip + primary value) beneath the header when collapsed, plus a `defaultCollapsed` prop to start collapsed. The default width is now a fixed 288px card (`w-72`); pass a width class such as `wwc:w-full` to override.
- b7d6bac: Add ProgressComparison component — a panel comparing two progress sources (e.g. actual vs. planned) with hero percentages, a variance pill, a combined bar, and an expandable stats grid. Variants: `progress` (status chip), `milestone` (stepper timeline), and `preview` (image preview + action button). Renders at a single compact density and fills its container (pass a width class such as `wwc:w-72` to fix it). Has a self-managing `collapsible` header button (or wire `onClose` to close a modal). `title` is optional — omit it to hide the title line when the name is already shown elsewhere. Designed to sit inside a modal.
- b7d6bac: feat(ui): keep the tab bar interactive in the collapsed TabbedLegend

  When a `TabbedLegend` is collapsed it now shows the tab bar plus an expand (+)
  button instead of a single chip. You can switch the active view while collapsed,
  and the selection persists when you expand to see the swatch grids again. The
  active tab is shared between the collapsed and expanded states.

- b7d6bac: Add TimelineRangeSelector component — a compact, embeddable timeline that selects a date range via draggable handles over a day strip, with `bar`/`dot` variants and a period dropdown (all / 1y / 3m / 1m).
- b7d6bac: feat(ui): add compact variant to TimestampPicker and Calendar

  `Calendar` now accepts a `size` prop (`"default" | "compact"`). The compact
  size shrinks day cells from 36×36px to 32×32px, nav buttons from 28px to
  24px, and reduces padding/spacing. Font sizes are unchanged from the default.

  `TimestampPicker` gains a `compact` boolean prop that drives the compact
  calendar and correspondingly tightens the trigger, date header, and time
  list spacing for dense layouts such as toolbars and side panels.

- b7d6bac: feat(ui): show a "Latest" badge on TimestampPicker when the newest capture is selected

  When the selected value is the single most recent capture across all `entries`,
  the collapsed selector now shows a blue "Latest" badge next to the label. The
  badge clears automatically when any earlier timestamp is selected.

- b7d6bac: feat(ui): add TimestampPicker component

  A pill-shaped selector for choosing a captured timestamp. The trigger shows the selected date + time (primary) and a subtitle (secondary) with a chevron. Clicking opens the standard calendar, where dates that have captured data are marked with a dot and dates without data are disabled. Selecting a date reveals a scrollable list of the times captured on that day, each with an optional label. Takes `entries: TimestampEntry[]` (`{ time: Date; label?: string }`), `value`, and `onChange`. Exported as `@wakecap/core-ui/timestamp-picker`.

- b7d6bac: feat(ui): add ToolbarColorPicker

  A PowerPoint-style color control for toolbars: a `ToolbarButton` trigger that previews the current color (as a swatch, or as a bar beneath a passed `icon`) and opens a `Popover` with grouped swatches, a **No fill** option (value `""`), a Recent row that fills as custom colors are picked, and an OS color picker via **More colors…**. Controlled/uncontrolled `value`, configurable `groups`, `columns`, `allowNoColor`/`noColorLabel`, `allowCustom`/`customLabel`, and `recentColors`. A `preview` prop chooses how the color shows next to `icon`: `"bar"` (default, beneath the icon) or `"swatch"` (a square to the right). A `compact` prop drops all labels and text so the popover is just the swatch grid — no-fill is the first swatch and the OS picker is a color-wheel swatch at the end. On supporting (Chromium) browsers an eyedropper button (native `EyeDropper` API) lets you sample any pixel on screen; it's feature-detected and hidden where unavailable. Exported as `@wakecap/core-ui/toolbar-color-picker`.

- b7d6bac: feat(ui): add Toolbar primitives and break CanvasToolbar into composable parts

  Introduces a `Toolbar` primitive family (`Toolbar`, `ToolbarButton`, `ToolbarSeparator`, `ToolbarGroup`, `ToolbarMenuButton`) and extracts the canvas toolbar's sections into standalone components: `CanvasFilePicker` (the file/drawing selector) and `ToolbarPager` (compact prev/next pager). `ToolbarMenuButton` is a generic dropdown-button (single-select picker or plain action menu) extracted from the shape/line/pin pickers in `DrawingActions`. `DrawingActions` and `ZoomTools` are refactored to compose the new primitives, and `CanvasToolbar` is rebuilt on top of all of them. Public APIs of `CanvasToolbar`, `DrawingActions`, and `ZoomTools` are unchanged.

- b7d6bac: feat(ui): add ToolbarStats component

  A full-width toolbar of labeled metric tiles (caption over a bold value). `groups`
  splits the row into divider-separated sections; values flagged `negative` render in
  the destructive color. `variant="cards"` (default) draws separate bordered tiles on
  the Card `stat` variant; `variant="table"` draws a bare row of full-height cells split
  by full-height internal dividers (no outer outline).

- b7d6bac: feat(ui): add VerticalZoomTools and make Toolbar orientation-aware

  A compact vertical zoom control (Zoom In over Zoom Out) intended to float over a map or canvas — the vertical counterpart to `ZoomTools`. Controlled/uncontrolled via `zoomLevel`/`onZoomIn`/`onZoomOut` with auto-derived enabled state (`minZoom`/`maxZoom`, overridable with `canZoomIn`/`canZoomOut`), and a `variant` (`"default"` | `"bare"`) so it can be the first section of a larger vertical floating toolbar. Exported as `@wakecap/core-ui/vertical-zoom-tools`.

  The `Toolbar` primitive gains an `orientation` prop (`"horizontal"` default | `"vertical"`) — a vertical toolbar lays items in a column and sets `aria-orientation` — and `ToolbarSeparator` gains a matching `orientation` prop (`"vertical"` default | `"horizontal"`) to render a rule across a vertical toolbar. Existing horizontal usage is unchanged.

- b7d6bac: feat(ui): WeekSelector defaults the uncontrolled selection to the latest week

  The uncontrolled default selection is now the latest (last) week instead of the
  middle one. Pass `defaultValue` to override. `visibleCount` defaults to 4.

- b7d6bac: Add WeekSelector — a compact week picker with a clickable date-range label that opens a calendar (jump to any week), previous / next chevrons that step the selected week while keeping it centered in the tabs, and a segmented row of week tabs built on the shared `Tabs` component. Controlled or uncontrolled via `value` / `defaultValue`.
- b7d6bac: feat(ui): show a zoom percentage in ZoomTools

  `ZoomTools` now shows the current zoom level as an **editable percentage** between the zoom-out and zoom-in buttons (container-less, derived from `zoomLevel`). Type a value and press Enter (or blur) to set the zoom: pass `onZoomChange(zoomLevel)` to receive the new multiplier (clamped to `minZoom`/`maxZoom`); without it the field is read-only. Use `showPercentage={false}` to hide it. Adds a `variant` prop — `variant="bare"` drops the bordered toolbar surface so ZoomTools can be embedded inside other chrome (e.g. a view header) without drawing its own container. **Redesigned as a single unified control** — zoom-out · percentage · zoom-in · Fit grouped in one container with no separators and a flat (borderless) Fit button. Removes the Scale button and its `scaleLabel`/`onScale` props.

### Patch Changes

- b7d6bac: style(ui): left-align the CanvasNavigator collapsed-view label

  The collapsed stepper's label now aligns left (was centered) between the prev/next
  controls.

- b7d6bac: `CanvasNavigator`: the collapsed view is now a segmented bar — a back button (up to the parent level) alongside the sibling pager and expand control, with dividers between each segment.
- b7d6bac: style(ui): make the CanvasNavigator background white

  The panel now uses a white background (`bg-white`) instead of the `card` token.

- b7d6bac: style(ui): set Legend text to 14px

  Bump all Legend / TabbedLegend text (labels, descriptions, status, footnotes,
  tab triggers, collapsed bar) to 14px (`text-sm`).

- b7d6bac: Use chevron icons for the collapse/expand toggle on `Legend`/`TabbedLegend` and `ProgressComparison` (replacing the minus/plus icons).
- b7d6bac: `Legend` / `TabbedLegend`: use `rounded-lg` corners (matching the canvas navigator). `TabbedLegend` keeps underline tabs when expanded, but drops the underline (list border + active indicator) when collapsed — the active view reads via its bold label instead.
- b7d6bac: fix(ui): position MapCompareLayout per-view controls at the top center

  `mapCenter` / `compareMapCenter` slots now sit at the top center of each
  source (`top-3`) instead of the vertical middle, so floating controls like a
  `TimestampPicker` don't cover the center of the map.

- b7d6bac: `TabbedLegend` no longer shrinks when expanded — the expanded tab row now reserves the same trailing space as the collapsed view's toggle button, so the panel stays at least as wide as its collapsed state.
- b7d6bac: fix(ui): snap TimelineRangeSelector handles to day marks

  Handles are now positioned at the center of each day's cell — where the dot/bar
  is drawn — and dragging hit-tests to the day whose cell sits under the pointer.
  Previously handles used an edge-to-edge model that didn't line up with the
  centered marks, so a dragged handle could land in the gap between days instead
  of on a day.

- b7d6bac: style(ui): tighten WeekSelector spacing

  Reduce the gap between elements to 4px, the container padding to 12px/8px, and
  the date-button icon/label gap to 4px for a more compact control.

## 0.3.0

### Minor Changes

- 032bd76: Add Stepper component (`@wakecap/core-ui/stepper`) with composable parts:
  `Stepper`, `StepperList`, `StepperItem`, `StepperIndicator`, `StepperLabel`,
  `StepperDescription`, `StepperSeparator`. Supports `vertical` and `horizontal`
  orientations and exposes per-item state (`completed` | `current` | `upcoming`)
  via `data-state` for styling overrides.
- d25e843: Add a `density="compact"` variant to the app shell:

  `CoreAppSidebar`:

  - New `density?: "comfortable" | "compact"` prop. Compact shrinks nav-row
    padding, text, icons, group labels, separators, item spacing, the org
    switcher header, the find bar, the find button, and the footer.
  - In compact, the org switcher reduces to the WakeCap "W" mark + a "WC3"
    label (uses `currentColor` so it adapts to light/dark themes).
  - In compact, the find bar becomes a transparent inline live filter that
    searches the nav groups + items, with an `X` clear button and a
    "No results" empty state — no popover.
  - The footer notifications bell is hidden in compact, the user avatar /
    name is no longer a duplicate dropdown trigger, and the 3-dots menu
    shrinks its items, drops the gear icon next to the user name, and
    exposes only Light / Dark themes (no system option) plus Log Out and
    the new Source block.
  - New `platformStatus?: { commit?: string; branch?: string }` prop
    renders a "SOURCE" footer block with build/version metadata. The
    earlier "All systems normal" line and status dot are removed.
  - Nav-row hover lightened to `bg-muted/50` so it reads as clearly
    lighter than the active `bg-muted` state.

  `CoreAppTopBar`:

  - New `density?: "comfortable" | "compact"` prop. Compact renders at 36px
    height (h-9) with smaller sidebar toggle, project switcher button,
    chevron, breadcrumb text, right-side menu, and project-popover (header
    padding, input, item gap/padding/text, Esc badge, check icon).
  - New `projectGroups?: { org: string; projects: string[] }[]` prop.
    When provided, the switcher renders org headers with their projects
    nested below, the search input matches both org and project names,
    and its placeholder updates to "Search project or organization...".
    Falls back to the flat `projects` array when omitted.

- 4686f65: Add `variant` and `size` props to `Tabs`. `variant` accepts `"default"` (rounded
  pill, current behavior) or `"underline"` (text triggers over a full-width bottom
  strip, with a thick underline on the active tab). `size` accepts `"sm"`, `"md"`
  (default), or `"lg"`, scaling text size and padding on both variants. The
  underline variant works with all `display` modes on `TabsTrigger` (`"text"`,
  `"icon"`, `"icon-text"`), enabling leading icons alongside labels.

### Patch Changes

- d2e6927: Add JSDoc descriptions for `Chip` and `TreeRow` so they appear in Storybook autodocs and the components manifest.
- 14f0f49: `CoreAppSidebar` now fills the viewport height (`h-screen`) by default
  instead of inheriting its parent's height (`h-full`). The previous behavior
  required the consumer to wrap the sidebar in an explicit-height parent;
  without one (e.g. when shown directly in a Storybook canvas) it collapsed
  to ~0px. The new rule makes the sidebar render correctly at full available
  height regardless of where it's mounted.
- dd97a67: `CoreAppSidebar` (compact density): restore the pin button in the header
  when the sidebar is unpinned (peek / collapsed). It sits at the left
  edge of the W + WC3 mark and reuses the existing `onPin` callback — same
  behavior as the comfortable variant. Without this, there was no way to
  re-pin the sidebar from the compact app shell once collapsed.

## 0.2.0

### Minor Changes

- 9c95902: Add new public components and subpath exports.

  **New components:**

  - `Chip` — toggleable filter chip and static attachment chip variants (`@wakecap/core-ui/chip`)
  - `PromptInput` — chat-style input with attachments and context items (`@wakecap/core-ui/prompt-input`)
  - `ThinkingPill` — assistant "thinking" indicator (`@wakecap/core-ui/thinking-pill`)
  - `TurnTimer` — running/done turn duration display (`@wakecap/core-ui/turn-timer`)
  - `TreeRow` — shared row primitive for tree/hierarchy tables (`@wakecap/core-ui/tree-row`)
  - `AIChat`, `AIChatHeader`, `AIChatMessage` — composable inline chat surface (`@wakecap/core-ui/chat/core-ai-chat*`)
  - `CoreAppSidebar`, `CoreAppTopBar` — application shell navigation (`@wakecap/core-ui/navigation/core-app-*`)

## 0.1.0

### Minor Changes

- 5816c1b: Add consumer CSS compatibility for Tailwind 3 and Tailwind 4 projects.

  **@wakecap/core-tokens:**

  - Restructure: extract `theme.css` as single source of truth for design tokens
  - Add `@wakecap/core-tokens/theme` export for TW4 consumers (no Tailwind import, no prefix)
  - Add `@wakecap/core-tokens/tailwind3-preset` export for TW3 consumers
  - `index.css` now imports `theme.css` internally (monorepo use unchanged)

  **@wakecap/core-ui:**

  - Add `flatten-css.mjs` build script (PostCSS + cssnano) producing two CSS outputs:
    - `styles.css` — for no-Tailwind and TW3 consumers (flattened, includes reset)
    - `styles.tw4.css` — for TW4 consumers (keeps @layer, no reset)
  - Add `@wakecap/core-ui/styles.tw4.css` export
  - Add `postcss` and `cssnano` as devDependencies

### Patch Changes

- Updated dependencies [5816c1b]
  - @wakecap/core-tokens@0.2.0

## 0.0.2

### Patch Changes

- Updated dependencies [ea8a1d2]
  - @wakecap/core-tokens@0.1.0
