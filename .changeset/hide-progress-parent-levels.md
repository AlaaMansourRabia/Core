---
"@core/core-ui": minor
---

Hide SPA progress on the parent grouping levels (phase / zone / batch / block)

On the parent grouping levels the map and left rail no longer surface progress — the underlying values are
untouched, they are just not shown. Only the villa (leaf) level still colours and reports progress.

- `SiteImageViewer` gains a `monochrome` prop: when set, every polygon renders one neutral grey
  (`MONOCHROME_STYLE`) instead of the progress/variance ramp. `BuildingViewer` passes `monochrome={isParent}`
  to both the plan and satellite branches, so grouping polygons go grey while villa polygons keep their ramp.
- In `SitePanel`, the "on map" list rows drop their `%` value and show a grey swatch on parent levels, and
  parent rows in the global search results do the same (villa rows are unchanged). The progress-distribution
  container keeps its SPA/Progress tabs on every level; on a parent level the **SPA** tab hides its bar +
  bucket metrics while the **Progress** (variance) tab still shows the full distribution.
