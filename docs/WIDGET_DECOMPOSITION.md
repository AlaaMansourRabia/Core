# CaptureUiEnhanced → 4 Controlled Core Widgets

**Source:** `packages/components/src/pages/capture-ui-enhanced.tsx` (component body 1851–3917).
**Goal:** split the monolith into 4 reusable, composable, testable widgets, each a **controlled component**.

## Architecture in one paragraph

`CaptureUiEnhanced` today is a single closure over ~50 `useState`/`useRef` values. Almost every state value is read by two or more visual regions, so the four regions are really four *views* over one state machine. The decomposition keeps that reality honest: **the host (`CaptureUiEnhanced`) remains the single owner of all shared/business state and of the navigation state-machine** (`runMapTransition`, `selectView`, `selectMode`, `selectLevel`, `stepLocation`, `openVilla`, `closeDetail`, `drillDownLevel`, navigator `onSelect`, `showJumpToast`). Each widget receives the slices of that state it renders as **props**, and emits **semantic callbacks** (e.g. `onSelectView("villa")`, not `setView`) so the reducer logic — guards, jump-toast, forced `mapMode="progress"` on 3D entry, `threeDLoaded` lifecycle, the 500ms/600ms transition phases — stays in exactly one place. Each widget holds **only its own local UI state**: open/close of its own menus, hover, drag, local animation flags, and its own DOM refs/measurements. No widget owns any value another widget needs.

This is deliberately **not** four peers passing state to each other. It is a controller (host) + four controlled views. That is what makes each widget independently mountable in Storybook with plain props and spies.

---

## 1) SHARED-STATE CONTRACT

Every value below is a `useState`/`useRef` in the host today and stays there. "Read prop" = the prop name the widget receives the value under. "Change callback" = the semantic callback the widget calls to request a change (the host runs the reducer). A widget appears in a row only if it touches that value. Widget codes: **BV** BuildingViewer, **SP** SitePanel, **ST** SiteToolbar, **PS** ProgressSheet.

### 1a. View axes (the navigation state-machine)

| Host state | Type | Widgets: read prop → change callback |
|---|---|---|
| `view` | `ViewId` (`"villa"\|"batch"`) | **BV** `view` (key/click-mode) · **SP** `view` (row shape via `isParent`) · **ST** `view` → `onSelectView(v)` |
| `mode` | `ViewMode` (`"plan"\|"satellite"\|"3d"`) | **BV** `mode` (which layer renders) · **SP** `mode` (stepper lockout) · **ST** `mode` → `onSelectMode(m)` |
| `level` | `LevelId` (`"batch"\|"zone"\|"phase"`) | **BV** `level` (key) · **SP** `level`+`activeLevel`+`locationLabel` · **ST** `level`+`activeLevel` → `onSelectLevel(l)` |
| `currentLocation` | `string` (zone id) | **BV** `currentLocation` (villa key/basemap) · **SP** `currentLocation`+`locationLabel`+`locationIndex` → `onStepLocation(dir)` / `onNavigate(node)` |

The host exposes derived reads (`isParent`, `activeLevel`, `LevelIcon`, `locationLabel`, `satelliteBasemap`, `hasSatellite`, `levelView`, `zoneVilla`, `unitNoun*`, `countNoun`) as plain computed props alongside the raw axes — widgets never recompute them.

### 1b. Selection & detail (BV ↔ SP)

| Host state | Type | Widgets: read prop → change callback |
|---|---|---|
| `selectedId` | `string` | **BV** `selectedVillaId`, `selectedPlot` (→3D `fitVilla`) · **SP** `selectedId` (list active + detail body) → `onSelectVilla(id)` |
| `detailOpen` | `boolean` | **BV** `detailOpen` (gates `selectedVillaId`/`selectedPlot`) · **SP** `detailOpen` (rail↔detail swap) → `onSelectVilla`/`onCloseDetail` · **BV/ST** read it as `panelGeometry.detailOpen` for the Layers left-offset |

### 1c. Colour mode (BV ↔ SP)

| Host state | Type | Widgets: read prop → change callback |
|---|---|---|
| `mapMode` | `MapMode` (`"progress"\|"variance"`) | **BV** `mapMode` (recolours 3D + 2D) → `onMapModeChange(m)` (SiteImageViewer legend) · **SP** `mapMode` (distribution tabs, list dots) → `onMapModeChange(m)` |

### 1d. Layer visibility & 3D opacity (BV ↔ host; Layers overlay lives in **BV**)

| Host state | Type | Widget: read prop → change callback (all **BV**) |
|---|---|---|
| `mesh3dOn` | `boolean` | `mesh3dOn` → `onMesh3dOnChange(b)` |
| `model3dOn` | `boolean` | `model3dOn` → `onModel3dOnChange(b)` |
| `model3dOpacity` | `number` (0..1) | `model3dOpacity` → `onModel3dOpacityChange(n)` |
| `progressColours` | `boolean` | `progressColours` → `onProgressColoursChange(b)` |
| `showLabels` | `boolean` (shared 2D+3D) | `showLabels` → `onShowLabelsChange(b)` |
| `showPolygons` | `boolean` | `showPolygons` → `onShowPolygonsChange(b)` |
| `threeDLoaded` | `boolean` | `keep3dMounted` (derived) — read only; host toggles it (3D entry / `level!=="batch"` unload) |
| `mesh3dOpacity` | `number` const `1` | `mesh3dOpacity` — read only |

### 1e. Map transition machine (host-owned; consumed by **BV**)

| Host state | Type | **BV** read prop |
|---|---|---|
| `mapPhase` | `"idle"\|"out"\|"in"` | `showSpinner` (= `mapPhase==="out" \|\| mapLoading`) |
| `mapEntering` | `boolean` | folded into `mapScaledOut`/`mapBlurred` |
| derived `mapScaledOut` | `boolean` | `mapScaledOut` |
| derived `mapBlurred` | `boolean` | `mapBlurred` |
| `jumpToast` / `jumpToastLeaving` | `string\|null` / `boolean` | `jumpToast`, `jumpToastLeaving` (BV renders the toast; host fires `showJumpToast` inside `selectView`) |

`props.mapLoading` (host prop) folds into all three derived flags exactly as today.

### 1f. Imperative 3D handle (BV → host → ST reducer)

| Host ref | Type | Flow |
|---|---|---|
| `realityViewerRef` | `React.MutableRefObject<FootprintViewer\|null>` | **BV** creates the viewer and calls `onViewerReady(api)`; host stores it. Host's `selectMode` reducer reads `realityViewerRef.current?.isZoomedIn()` when leaving 3D. **ST never touches the ref** — it only calls `onSelectMode`, and the host does the `isZoomedIn` branch. |

### 1g. Timeline & reports (PS ↔ host; consumed by **BV**)

| Host state | Type | Widgets: read prop → change callback |
|---|---|---|
| `capture` | `string` (week value) | **PS** `capture`+`selectedWeek`+`rangeLabel` → `onCaptureChange(v)` · read by host for Blueprints dialog label |
| `reportsOpen` | `boolean` | **PS** `reportsOpen` → `onReportsOpenChange(b)` · **BV/SP/ST** read as `chromeHidden`/`chromeFade` |
| `reportScrollY` | `number` | **PS** owns scroll el → `onReportScroll(y)` · **BV** `reportScrollY` (map `translateY(-y)`) |

### 1h. Search geometry (SP-driven; crosses to BV Layers offset)

| Host state | Type | Widgets |
|---|---|---|
| `searchOpen` | `boolean` | **SP** `searchOpen` → `onSearchOpenChange(b)` (full-height panel) · fed into `panelGeometry` for **BV** Layers left-offset |
| `sidebarFull` | `boolean` (measured) | host `useLayoutEffect` measures **SP**'s panel (via `onPanelResize`) → feeds `panelGeometry` → **BV** Layers offset |

### 1i. Screen gate

| Host state | Type | Note |
|---|---|---|
| `screen` | `"screen-1"` | Never written; host keeps it as the top-level render gate around all four widgets. Not passed down. |

### Values that are **NOT** shared (stay local to exactly one widget — see §2)

`levelMenuOpen` (ST) · `navMode`/`hoverCode`/`error`/viewer & backdrop refs (BV, inside the canvas child) · `layersOpen` (BV) · `query`/`searchLevels`/`searchSort`/`sortMenuOpen`/`railCollapsed`/`navigatorOpen`/`railGhost`/`detailTab`/`evidenceTab`/`detailScrollbar*`/`blueprintsOpen` (SP) · `timelineOpen`/`timelineMenuOpen`/`datePickerOpen`/`gridCols`/`offset`/`dragging`/`handleX` (PS).

> **Note on `query`:** it is shared *within* SitePanel (rail search ↔ detail search ↔ full-height panel) but no other widget reads it, so it is SitePanel-local, not host state. If a host ever needs the live query it can subscribe via an optional `onQueryChange`.

---

## 2) THE FOUR WIDGETS

Shared imported types used across signatures (re-exported from the package root):
`ViewId`, `ViewMode`, `LevelId`, `MapMode`, `SiteVilla` (`Villa`), `ZoneVillaView`, `SatelliteBasemap`, `CanvasNavigatorNode`, `TimelineWeek`, `CaptureDetailVilla`, `FootprintViewer`.

---

### 2A. BuildingViewer → `src/building-viewer.tsx`

Renders the map region: the 3D reality layer, the 2D/satellite `SiteImageViewer`, the loading spinner, the jump toast, and the **Layers overlay** (layer-visibility control belongs to the viewer, not the reports sheet). The 3D reality viewer is a **canvas-only child**: `createFootprintViewer` (and any `createSiteViewer`) stay in their own modules (`../footprint-viewer`), lazy-`import()`-ed exactly as today; BuildingViewer only mounts the canvas container, the 3D-tools toolbar, the plan-image backdrop `<img>`, the vignette, and the "3D model unavailable" fallback.

```ts
export type BuildingViewerMapData = {
  /** Resolved by the host from zoneVilla / levelView. */
  villas: SiteVilla[];
  backgroundUrl: string;
  imageWidth: number;
  imageHeight: number;
  /** Stable React key the host computes: isParent ? level : `villa-${currentLocation}`. */
  contentKey: string;
};

export type BuildingViewerProps = {
  // ---- view axes (read-only) ----
  mode: ViewMode;
  view: ViewId;
  level: LevelId;
  currentLocation: string;
  /** view === "batch" && level !== "batch" — parent view draws grouping polygons + drills down. */
  isParent: boolean;

  // ---- data the map draws ----
  map: BuildingViewerMapData;
  satelliteBasemap: SatelliteBasemap | null;

  // ---- selection (read-only; host owns) ----
  /** SiteImageViewer highlight: detailOpen && !isParent ? selectedId : undefined. */
  selectedVillaId?: string;
  /** 3D camera target: detailOpen && selectedId ? selectedNumber : undefined. */
  selectedPlot?: number;

  // ---- colour mode ----
  mapMode: MapMode;

  // ---- 3D layer state ----
  mesh3dOn: boolean;
  mesh3dOpacity: number;        // constant 1 today
  model3dOn: boolean;
  model3dOpacity: number;       // 0..1
  progressColours: boolean;
  showLabels: boolean;
  showPolygons: boolean;
  /** threeDLoaded || mode === "3d" — keep the mesh mounted across Plan↔Reality. */
  keep3dMounted: boolean;

  // ---- transition / chrome (read-only, host-owned machine) ----
  mapScaledOut: boolean;
  mapBlurred: boolean;
  showSpinner: boolean;         // mapPhase === "out" || mapLoading
  /** reportsOpen — hide the viewer's own hover card/legend/zoom tools + fade chrome. */
  chromeHidden: boolean;
  /** transition-opacity duration-500 + opacity-0 pointer-events-none when reportsOpen. */
  chromeFade: string;
  /** Map wrapper translateY(-reportScrollY) parallax during report scroll. */
  reportScrollY: number;

  // ---- jump toast (host fires it, BV renders it) ----
  jumpToast: string | null;
  jumpToastLeaving: boolean;

  // ---- Layers overlay positioning (host-computed geometry) ----
  /** Precomputed left offset: 412 detailOpen / 372 searchOpen / 340 sidebarFull / 12. */
  layersOffsetLeft: number;
  /** Noun for the polygon toggle row ("Villas"/"Zones"/…). */
  polyNoun: string;
  /** 2D vs 3D branch for the Layers panel body. */
  hide3dLayers?: boolean;

  // ================= CALLBACKS OUT =================
  /** 3D footprint click (passes plot code) OR 2D leaf polygon click (passes villa id).
   *  Host resolves villaByPlot, hops currentLocation if cross-zone, then openVilla. */
  onSelectVilla: (idOrPlot: string) => void;
  /** 2D parent-view polygon click → host.drillDownLevel(id). */
  onDrillDown: (id: string) => void;
  /** SiteImageViewer's internal SPA/Construction legend toggle. */
  onMapModeChange: (m: MapMode) => void;
  /** Surfaces the lazy-created FootprintViewer to the host (stored in realityViewerRef). */
  onViewerReady: (api: FootprintViewer) => void;

  // Layers overlay switches → shared state
  onMesh3dOnChange: (b: boolean) => void;
  onModel3dOnChange: (b: boolean) => void;
  onModel3dOpacityChange: (n: number) => void;
  onProgressColoursChange: (b: boolean) => void;
  onShowLabelsChange: (b: boolean) => void;
  onShowPolygonsChange: (b: boolean) => void;
};
```

**Own local state (BuildingViewer):**
- `layersOpen: boolean` — the Layers overlay open/close (button + X). Purely presentational; nothing else reads it.
- Inside the canvas child (`RealityMeshCanvas`, kept as an internal component of this file):
  - `navMode: "orbit"|"pan"` — Pan/Orbit toolbar toggle (local, never leaves the canvas).
  - `hoverCode: string|null` — footprint hover chip.
  - `error: boolean` — drives the "3D model unavailable" fallback.
  - refs: container `ref`, `bgRef` (backdrop `<img>`), `viewerRef`, `plotToCode`, `onSelectRef`, `selectedPlotRef`.

**Interactions to preserve:**
3D tools — Zoom in / Zoom out / Reset view / Satellite top-down / Pan / Orbit (imperative `viewerRef` calls; Pan/Orbit set `navMode`). Footprint hover → chip; footprint click → `onSelectVilla(plot)`. 2D `SiteImageViewer` — polygon click → `onSelectVilla(id)` (leaf) or `onDrillDown(id)` (parent), internal legend toggle → `onMapModeChange`. Layers overlay — open/close, and the six switches/slider → the six `on*Change` callbacks. Camera reactions: on `selectedPlot` change → `fitVilla`; on entering Reality with no selection → `resetView`; pre-selected villa carried in via `selectedPlot`.

**Animations to preserve:**
3D-layer wrapper `transition-all duration-500 ease-in-out` + `scale-[0.95] rounded-[25.26px] overflow-hidden` (mapScaledOut) + `blur-sm` (mapBlurred), `hidden` when `mode!=="3d"`. Per-frame camera-driven backdrop `<img>` (`opacity`/`blur`/`scale` inline via `onBackdrop`, `willChange`). Static vignette. Spinner while `showSpinner`. Jump toast enter/leave (`animate-in/out … slide-…-top-4`, `duration-300`; host owns the 2200/2500ms timers). Mode-tile/level `transition-colors`. Layers button `transition-[left] duration-300 ease-in-out` (driven by `layersOffsetLeft`). Map wrapper `translateY(-reportScrollY)` parallax.

**Canvas-only child contract:** BuildingViewer must NOT import three/@thatopen directly. It keeps the dynamic `import("../footprint-viewer")` → `createFootprintViewer` inside `RealityMeshCanvas`, exposes the created `FootprintViewer` through `onViewerReady`, and treats the viewer as an opaque API (`zoomIn/zoomOut/resetView/topDownView/fitVilla/selectVilla/isZoomedIn/setInteractionMode/setColourMode/getVillaRecord/…`).

---

### 2B. SitePanel → `src/site-panel.tsx`

Renders the entire left overlay stack: the floating rail (search field, **location stepper**, zone progress, SPA/Progress distribution, villa list), the `CanvasNavigator`, the full-height search-results panel, the rail shrink-ghost, and the villa **detail panel** (Overview/Floors/Evidence/Activities). Three mutually-exclusive overlays + helpers, exactly as today, but all shared reads/writes go through props/callbacks.

```ts
export type SitePanelProps = {
  // ---- view axes (read-only) ----
  view: ViewId;
  mode: ViewMode;                 // stepper is inert in 3D
  level: LevelId;
  activeLevel: { id: LevelId; label: string; icon: React.ComponentType };
  currentLocation: string;
  locationLabel: string;
  locationIndex: number;

  // ---- rows / nouns (host-derived) ----
  isParent: boolean;
  activeRows: SiteVilla[];        // the rail list + zone KPI source
  unitNoun: string;
  unitNounSingular: string;
  countNoun: string;

  // ---- selection / detail ----
  selectedId: string;
  detailOpen: boolean;
  detailVilla?: CaptureDetailVilla;   // resolved detail record
  selected?: SiteVilla;
  selectedNumber?: number;
  selectedBatch?: string;
  selectedPath?: string;

  // ---- colour mode + distribution ----
  mapMode: MapMode;
  distribution: DistributionModel;    // host memo (buckets by mapMode)

  // ---- navigator ----
  navNodes: CanvasNavigatorNode[];

  // ---- geometry / chrome ----
  chromeFade: string;                 // reportsOpen fade
  maxPanelH: number;                  // host-measured height cap

  // ---- detail-tab visibility (host props pass-through) ----
  hideFloors?: boolean;
  hideEvidence?: boolean;
  hideActivities?: boolean;
  hideMilestones?: boolean;
  hideSearch?: boolean;

  // ---- search open (shared: crosses to Layers offset) ----
  searchOpen: boolean;

  // ================= CALLBACKS OUT =================
  onSelectVilla: (id: string) => void;      // list row / navigator leaf → openVilla
  onCloseDetail: () => void;                // detail X / Escape
  onStepLocation: (dir: -1 | 1) => void;    // stepper prev/next
  onOpenNavigator: () => void;              // current-location card (host sets navigatorOpen? see note)
  onNavigate: (node: CanvasNavigatorNode) => void;  // navigator onSelect → runMapTransition
  onDrillDown: (id: string) => void;        // parent-list drill
  onMapModeChange: (m: MapMode) => void;    // SPA/Progress tabs
  onSearchOpenChange: (open: boolean) => void;  // full-height panel open/close
  /** Host measures the rail element for sidebarFull/maxPanelH + Layers offset. */
  onPanelResize?: (el: HTMLElement | null) => void;

  // detail-rail actions (forwarded to host props)
  onOpenBlueprints?: (villa: CaptureDetailVilla) => void;
  onOpenWalkthrough?: (villa: CaptureDetailVilla) => void;
  onOpenProgressDetails?: (villa: CaptureDetailVilla) => void;
};
```

**Own local state (SitePanel):**
`query` (shared only inside this widget: rail ↔ detail ↔ full-height), `searchLevels`, `searchSort`, `sortMenuOpen`, `railCollapsed`, `navigatorOpen`, `railGhost` (+ its shrink animation), `detailTab`, `evidenceTab`, `detailScrollbar`/`detailScrollbarTimer`/`detailScrollRef`, `blueprintsOpen` (internal fallback dialog only when no `onOpenBlueprints`), plus the helper-local state of `DashboardSearchField`, `VillaDetailSearch.expanded`, `RailSearchShrinkGhost.shrunk`, `panelRef`.

> `navigatorOpen` and `searchOpen`: `navigatorOpen` is a pure view-swap inside the panel → **local**. `searchOpen` must be lifted (host) only because the Layers control's left-offset reads it; SitePanel drives it via `onSearchOpenChange` and mirrors it in render. If we later decouple the Layers offset, `searchOpen` can move local too.

**Interactions to preserve:**
Rail search type/Enter/Escape/clear/collapse-chevron; scope options (Search-in-level / Search-all) → `onSearchOpenChange`; location stepper prev/next → `onStepLocation` (disabled in 3D), current-location card → `onOpenNavigator`; SPA/Progress tabs → `onMapModeChange`; "Villas on map" header → open full-height list, row → `onSelectVilla`; full-height panel input/close/level chips/sort/rows; `CanvasNavigator` `onSelect` → `onNavigate`, collapse → close; detail-pane search Enter → `onCloseDetail` + `onSearchOpenChange(true)`, tabs → local `detailTab`, action buttons → `onOpenBlueprints`/`onOpenWalkthrough`/`onOpenProgressDetails` (fallback dialog local), evidence sub-tabs, overlay-scrollbar ping.

**Animations to preserve:**
`chromeFade` opacity; rail collapse chevron rotate-180; `VillaDetailSearch` width morph 320px→full (`transition-[width] duration-300`); `RailSearchShrinkGhost` 376→320px self-removing; distribution flex-grow bars; detail overlay scrollbar fade (1s auto-hide); all `transition-colors` hovers; ring selection on active list row.

---

### 2C. SiteToolbar → `src/site-toolbar.tsx`

Renders the top-center canvas overlay only: the LEFT level-nav pill group (Villa button + Batch slot with the hover dropdown) and the RIGHT view-mode switcher (Reality / Plan thumbnails). Hand-rolled `<button>`s, not the DS `Toolbar` (that DS component is used by BuildingViewer's 3D tools). **The location stepper does NOT live here** — see §3.

```ts
export type SiteToolbarProps = {
  view: ViewId;
  mode: ViewMode;
  level: LevelId;
  activeLevel: { id: LevelId; label: string; icon: React.ComponentType };

  /** Level dropdown items (Batch/Zone/Phase). */
  levels: { id: LevelId; label: string; icon: React.ComponentType }[];
  /** Mode tiles (Reality/Plan); host filters out 3d when hide3d. */
  modeTabs: { id: ViewMode; label: string; thumb: string; icon: React.ComponentType }[];

  /** Satellite tile enable/disable (derived from view+level+currentLocation). */
  hasSatellite: boolean;
  hide3d?: boolean;

  /** reportsOpen fade + pointer-events-none. */
  chromeFade: string;

  // ================= CALLBACKS OUT =================
  onSelectView: (v: ViewId) => void;    // Villa / Batch buttons
  onSelectLevel: (l: LevelId) => void;  // dropdown item
  onSelectMode: (m: ViewMode) => void;  // Reality / Plan tile
};
```

**Own local state (SiteToolbar):**
`levelMenuOpen: boolean` — the Batch-slot hover dropdown (open on `onMouseEnter`, close on `onMouseLeave`; host also closes conceptually via re-render after `onSelectLevel`, but the boolean is local).

**Interactions to preserve:**
Villa click → `onSelectView("villa")`; Batch click → `onSelectView("batch")`; Batch-slot hover → toggle `levelMenuOpen`; dropdown item → `onSelectLevel(id)` (selected tick when `level===id && view==="batch" && mode!=="3d"`); Reality/Plan tile → `onSelectMode(m)` (host runs the `isZoomedIn`/`toVillaLevel`/`toSiteLevel` branch); Satellite tile disabled + crossed-slash when `!hasSatellite`.

**Animations to preserve:**
`chromeFade` opacity; left-group `transition-colors`; dropdown plain conditional render; mode tiles `transition hover:brightness-105` + active `border-primary ring-2 ring-primary` + focus-visible ring. (The jump toast, spinner, and map blur/scale are BuildingViewer's — SiteToolbar only *triggers* them via the callbacks; the host owns the machine.)

---

### 2D. ProgressSheet → `src/progress-sheet.tsx`

Renders the bottom toolbar (Progress Overview button + Timeline slot + week scrubber `WeekTimeline`) and the slide-up Reports sheet (dark/blur overlay, close, scroll layer, §1 milestone-progression waffle hero, §3 milestone-timing band via `ReportSections`). Owns the timeline scrubber and the reports scroll; the host owns `capture`/`reportsOpen`/`reportScrollY` because they cross to other widgets.

```ts
export type ProgressSheetProps = {
  // ---- timeline (host-owned selection) ----
  capture: string;
  timeline: TimelineWeek[];
  selectedWeek: TimelineWeek;
  rangeLabel: string;
  /** Calendar clamp range. */
  firstWeek: TimelineWeek;
  lastWeek: TimelineWeek;

  // ---- reports ----
  reportsOpen: boolean;
  showOnlyProgressionReport?: boolean;
  chromeFade: string;

  // ---- §1 hero data seam ----
  allVillas: SiteVilla[];
  progressionData?: { actualPercent: (number | null)[]; plannedPercent: (number | null)[] }[];

  // ================= CALLBACKS OUT =================
  onCaptureChange: (value: string) => void;   // WeekTimeline drag/step + date picker
  onReportsOpenChange: (open: boolean) => void; // Progress Overview toggle / close X / overscroll dismiss
  onReportScroll: (scrollTop: number) => void;  // drives BuildingViewer map parallax
};
```

**Own local state (ProgressSheet):**
`timelineOpen`, `timelineMenuOpen`, `datePickerOpen`, `gridCols` (+ `gridRef` ResizeObserver), `reportsScrollRef`, `overscrollRef`; and `WeekTimeline`-internal `offset`/`dragging`/`handleX`/`handleXRef`/`trackRef`. The `progression`/`progressionView` memos live here (pure derivation from `selectedWeek` + `progressionData` + `gridCols`).

**Interactions to preserve:**
Progress Overview → `onReportsOpenChange(!reportsOpen)`; Timeline button → toggle `timelineOpen` (local) + close menu; Timeline hover → `timelineMenuOpen`; Drone playback item inert; date button → `datePickerOpen`; calendar day → `onCaptureChange` (host `pickDate` clamps); scrubber chevrons/drag/edge-auto-scroll → `onCaptureChange`; sheet scroll → `onReportScroll`; wheel overscroll past 280px → `onReportsOpenChange(false)`; close X → `onReportsOpenChange(false)`; §1 waffle & §3 heatmap non-interactive.

**Animations to preserve:**
Toolbar pill `transition-colors`; `chromeFade`; `WeekTimeline` tick-strip `transform 300ms ease` (none while dragging), handle `left 200ms ease`, rAF edge auto-scroll (2→26 weeks/s), tick `transition-colors`; sheet slide `transition-transform duration-[550ms] ease-out` `translate-y-full`↔`0`; overlay `bg-black/60 backdrop-blur-md` opacity 500ms; close 500ms; §1 current-month `ring-2 ring-orange-400/80`. **Does not** call `runMapTransition` or move the camera — opening the sheet only fades/parallaxes the map.

---

## 3) Where the location stepper lives — DECISION

**The stepper renders inside SitePanel (the left rail), not SiteToolbar.**

Justification:
1. **Structural truth.** Today the prev/next chevrons + "Current location" card are JSX *inside the floating left rail* (`<aside>`), directly above "Zone progress" (lines 2828–2870). Moving it into SiteToolbar would force the top toolbar to render a control positioned in a completely different overlay.
2. **Data locality.** Its label (`locationLabel`), index (`locationIndex`), and disabled/inert state all derive from panel-scoped context that SitePanel already receives; SiteToolbar would otherwise need those props purely to render a control it doesn't visually contain.
3. **Sibling of the navigator.** The card opens `CanvasNavigator`, which *is* SitePanel's overlay. Stepper and navigator are two entries to the same location machine and belong together.
4. **The controlled pattern makes ownership irrelevant to behaviour.** Wherever it renders, it only calls host callbacks (`onStepLocation`, `onOpenNavigator`) and reads host props (`mode` for the 3D lockout, `locationLabel`). Placing it in SitePanel costs nothing in coupling because the host still owns `currentLocation` and `runMapTransition`.

SiteToolbar keeps the *level/view/mode* axes (which it visually contains); SitePanel keeps the *location* axis control (which it visually contains). Both write through the same host reducers.

---

## 4) INTEGRATION PLAN — rewiring the host to compose 4 widgets

### What STAYS in the host (`CaptureUiEnhanced`)
- **All shared state** from §1 (every `useState`/`useRef` listed there).
- **The whole navigation state-machine / reducers:** `runMapTransition`, `selectView`, `selectMode`, `selectLevel`, `toVillaLevel`, `toSiteLevel`, `stepLocation`, `openVilla`, `closeDetail`, `drillDownLevel`, navigator `onSelect`, `showJumpToast`, `pickDate`.
- **All derived memos** feeding props: `isParent`, `activeLevel`, `locationLabel`, `zoneVilla`/`levelView`, `satelliteBasemap`/`hasSatellite`, `unitNoun*`/`countNoun`, `distribution`, `selected`/`detailVilla`/`selectedNumber`/`selectedBatch`/`selectedPath`, `mapScaledOut`/`mapBlurred`, `keep3dMounted`, `chromeFade`, `villaByPlot`, `panelGeometry` (the Layers `left` computation), `selectedWeek`/`rangeLabel`/`firstWeek`/`lastWeek`.
- **The data-prop resolution** (`props.zoneViews ?? …` etc.) and all `CaptureUiEnhancedProps` (`onOpenBlueprints`, `hide3d`, `showOnlyProgressionReport`, `mapLoading`, `hideSearch`, tab-hide flags…), forwarded down unchanged.
- **Layout measurement** (`useLayoutEffect` + `ResizeObserver`) driving `sidebarFull`/`maxPanelH`, fed by SitePanel's `onPanelResize`.
- **The `realityViewerRef`** and the `selectMode` `isZoomedIn` branch.
- **The `screen==="screen-1"` gate** and the `<div ref={bodyRef}>` positioning context that wraps the four widgets.
- The **Blueprints `Dialog`** (host-level, opened by SitePanel's fallback or `onOpenBlueprints`).

The host render becomes roughly:
```tsx
<div ref={bodyRef} className="relative …">
  <BuildingViewer  {...bvProps} />
  <SiteToolbar     {...stProps} />
  <SitePanel       {...spProps} onPanelResize={setPanelEl} />
  <ProgressSheet   {...psProps} />
  {/* host-level Blueprints dialog */}
</div>
```

### Order of extraction (each step compiles + Storybook-verifies before the next)
1. **SiteToolbar first** — smallest surface, only 3 callbacks + `levelMenuOpen` local. Proves the "semantic callback into host reducer" pattern with the lowest risk.
2. **ProgressSheet** — mostly self-contained (owns `WeekTimeline`, progression memos, scroll); only `capture`/`reportsOpen`/`reportScrollY` cross out. Extract `WeekTimeline`, `ReportSections`, `MilestoneTiming*`, and the progression memos into this file.
3. **BuildingViewer** — extract with `RealityMeshCanvas` as an internal child and the Layers overlay. Verify the lazy `../footprint-viewer` import still code-splits and `onViewerReady` wires `realityViewerRef`. Confirm 3D↔2D↔satellite swap, backdrop, fallback, spinner, jump toast, parallax.
4. **SitePanel last** — largest (rail + navigator + full-height search + detail + stepper + helpers `DashboardSearchField`/`VillaDetailSearch`/`RailSearchShrinkGhost`). Verify `query` sharing across its three surfaces, the shrink-ghost, and `onPanelResize` feeding the host measurement.

After each extraction, run the existing Storybook story for the page plus a new per-widget story mounting it with plain props + spy callbacks.

### package.json exports (add alongside the existing page export)
```jsonc
{
  "exports": {
    "./building-viewer": { "types": "./dist/building-viewer.d.ts", "import": "./dist/building-viewer.mjs" },
    "./site-panel":      { "types": "./dist/site-panel.d.ts",      "import": "./dist/site-panel.mjs" },
    "./site-toolbar":    { "types": "./dist/site-toolbar.d.ts",    "import": "./dist/site-toolbar.mjs" },
    "./progress-sheet":  { "types": "./dist/progress-sheet.d.ts",  "import": "./dist/progress-sheet.mjs" }
  }
}
```
Mirror each in the build entry list (tsup/vite `entry`) and re-export the shared prop/types (`ViewId`, `ViewMode`, `LevelId`, `MapMode`, the four `*Props`) from the package root. Because Storybook loads built `dist/*.mjs`, every extraction needs a full `pnpm --filter @core/core-ui build` — a typecheck/HMR pass is not enough.

### Guardrails
- No widget imports another widget. All cross-widget data flows host→widget (prop) or widget→host (callback).
- No widget calls a `setX` for shared state directly; it calls a semantic `on*` callback and the host runs the reducer (preserves guards, jump-toast, forced `mapMode`, `threeDLoaded` lifecycle, and the single-`runMapTransition` lock at `mapPhase!=="idle"`).
- BuildingViewer never imports three/@thatopen — only the lazy `createFootprintViewer` inside its canvas child, surfaced via `onViewerReady`.
- Widget-local state never leaks: `levelMenuOpen`, `navMode`, `layersOpen`, `timelineOpen`, `query`, etc. stay put.
