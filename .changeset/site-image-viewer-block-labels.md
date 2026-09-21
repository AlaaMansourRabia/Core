---
"@wakecap/core-ui": minor
---

`SiteImageViewer`: block-name labels while zoomed out, villa labels once zoomed in (mirrors the 3D view)

The 2D plan view now supports the same Block → Villa label level-of-detail hand-off the 3D reality view
uses. Pass the new optional `blocks` prop (block-hull polygons in the same image-pixel space as `villas`,
e.g. `ALMANAR_ZONE_A_BLOCKS` from the fixtures) and the map shows one block-name chip per block while fully
zoomed out, swapping to the per-villa number chips once the user zooms in past 10% (`view.zoom >= 1.1`). Only
the labels swap — the villa polygon overlay stays drawn throughout. Omit `blocks` to keep the classic
"villa labels always" behaviour. Hovering a footprint always shows that villa's number chip, at any zoom —
so a villa can be identified even while the coarser block labels are up.

`BuildingViewerMapData` gains a matching optional `blocks` field, fed only to the villa (leaf) view, and the
`CaptureUiEnhanced` template wires each zone's block hulls through so its villa plan view gets the behaviour.

The default villa polygon `fillOpacity` is bumped from `0.3` to `0.37` (a slightly stronger colour wash over
the aerial); pass an explicit `fillOpacity` to override.
