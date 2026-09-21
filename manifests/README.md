# Widget & template manifests

The source-of-truth **manifest** layer for WakeCore's widget and template tiers (see
`docs/ARTIFACT-CLASSIFICATION.md`). A manifest is the machine-readable contract for a *composed* artifact
— what data it takes, how it's configured, what states it has, what it composes, and how to evaluate
correct use. It complements `library-index.json` (the per-artifact *decision* knowledge: intent / when /
chooseOver) with the *build* knowledge a generator or an agent needs to actually use the artifact.

This directory is **additive** — it does not move or change any component. Manifests sit beside
`library-index.json` at the repo root, the same way the catalog does.

## Why DataTable is the first widget pilot

`DataTable` is the cleanest possible first widget, for five first-principles reasons:

1. **It already is a widget.** It composes five components (Table, Button, Input, Popover, Collapsible)
   plus the TanStack Table engine, has product meaning (a data grid), and carries clear states.
2. **It has the cleanest data contract of any candidate** — `columns` + `data`. A widget manifest's whole
   point is the data/config boundary; DataTable's is explicit and already typed.
3. **It has rich, distinct states** (default / empty / selected / expanded / loading) — enough to prove
   the `states` field earns its place, without being a sprawling app-shell widget.
4. **It has a real, documented failure mode** (`fm-dt-1`: a `searchKey` that doesn't match a column id),
   so `commonMistakes` and `evaluationCriteria` are grounded in something that actually bites.
5. **Promoting it changes nothing for consumers** — the file doesn't move, the export
   (`@wakecap/core-ui/data-table`) is untouched, the API is unchanged. It's the lowest-risk way to prove
   the promotion path end-to-end: manifest → knowledge → stories → validation.

The next widget after DataTable should be **`core-app-sidebar`** — deliberately the *opposite* shape
(config-heavy, no row data) — to prove the manifest schema generalizes beyond data-bearing widgets
before we generalize the system.

## Files

- `data-table.widget.json` — the DataTable widget manifest (`artifact-manifest/0.1`).
- Validate it: `node scripts/validators/widget-manifest.mjs` (DataTable-only for now; not generalized).

## Status

Pilot. The manifest **system** (schema engine, registry, codegen, enforcement) is intentionally **not**
built yet — only this one manifest, its validator, and its Storybook surface, to prove the path.
