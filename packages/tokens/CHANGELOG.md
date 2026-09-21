# @wakecap/core-tokens

## 0.8.0

### Minor Changes

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

## 0.7.1

### Patch Changes

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

## 0.7.0

### Minor Changes

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

## 0.6.0

### Minor Changes

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

## 0.5.0

### Minor Changes

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

## 0.4.0

### Minor Changes

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

- 517bf13: add a fixed `--radius-control` (4px) for small controls, and pin the checkbox, MultiSelect indicator, and colour swatches to it so the 8px base radius no longer rounds them into circles
- 517bf13: bump the corner radius token from 4px to 8px; align date-picker triggers to the 36px form-control height so they sit level with Input and Select

## 0.3.0

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

## 0.2.0

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

## 0.1.0

### Minor Changes

- ea8a1d2: Separate Google Fonts loading into opt-in `@wakecap/core-tokens/fonts` import. Consumers must add `@import "@wakecap/core-tokens/fonts"` to load Figtree, Lora, and IBM Plex Mono from Google Fonts.
