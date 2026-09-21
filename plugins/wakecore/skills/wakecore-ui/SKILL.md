---
name: wakecore-ui
description: Build, bootstrap, modify, or review React and TSX applications with @wakecap/core-ui. Resolves templates, plans artifact adoption, and validates the resulting multi-file implementation against a goal-specific WakeCore compliance mode.
---

# WakeCore UI

Use this skill for every task that creates, changes, refactors, or reviews a React UI that can use WakeCore. WakeCore is authoritative for layout, templates, widgets, components, imports, tokens, and completion validation.

## Workspace assessment

Before editing, inspect the target workspace and record whether it already has:

1. A React runtime that the target can render.
2. TypeScript/TSX support for the implementation target.
3. `@wakecap/core-ui` installed or available in the workspace dependency graph.

Missing workspace prerequisites are setup work, not an immediate blocker. Continue through template resolution and planning, then prepare the workspace in stage 3. Stop only when the `wakecore` MCP server or a required workflow tool is unavailable; report the missing server or tool and do not approximate its answer from memory.

## Choose the implementation goal

Record one goal before planning. Use the user's explicit goal when supplied; otherwise infer the narrowest suitable goal from the request:

- `product-ui`: build or modify a product interface for normal use. Validate with `wakecore-product`.
- `wakecore-showcase`: demonstrate, test, or evaluate meaningful WakeCore adoption. Validate with `wakecore-showcase`.
- `component-evaluation`: visibly exercise selected components, variants, states, and interactions. Validate with `wakecore-showcase`; relevance is defined by the plan contract, so unrelated widgets are not required.
- `visual-reproduction`: reproduce a selected WakeCore template with strict structural fidelity. Validate with `wakecore-template-strict`.

Do not use the imports-only mode as the completion gate for a product, showcase, or template-reproduction task. `wakecore-only` is a deprecated alias for `wakecore-imports`; use it only when checking a legacy integration that cannot yet send the new mode.

## Mandatory workflow

Follow these stages in order. A later stage is forbidden until the preceding stage returns an executable result.

### 0. Analyze reference images

When one or more screenshots or visual references are supplied, analysis is a blocking gate before template resolution or implementation edits. Do not begin by recreating the source HTML, CSS, colors, geometry, or interaction model.

Create a structured `referenceAnalysis` map for every image covering product shell, navigation model, sidebar/top-bar density, route identity, visible regions and hierarchy, repeated patterns, scroll ownership, responsive implications, implied interactions, semantic relationships such as parent/back navigation, and source-brand traits that WakeCore must replace. Preserve the reference's information architecture, hierarchy, density, content, and user intent; WakeCore remains authoritative for shell, artifacts, visual language, states, tokens, accessibility, and interaction behavior.

Pass the completed `referenceAnalysis` to `resolve_template` and carry the exact map into `create_implementation_plan`. Every analyzed region must receive a named WakeCore owner or an explicit catalog gap. No implementation file may be edited until this map exists.

### 1. Resolve the template

Call `resolve_template` first with the user's full UI intent before editing any implementation file. Treat its strategy as binding, but never ask for confirmation or stop solely because confidence is low or no template matched:

- `direct-template`: use the selected template's `requiredImport` and `minimalExample` exactly. Never recreate it with standalone HTML/CSS or generic elements.
- `adapt-template`: use the nearest template as a structural and interaction reference, then modify its composition to meet the request with WakeCore artifacts.
- `compose`: proceed without a template and discover the required WakeCore widgets, components, patterns, and utilities.

Follow `selectionGate.fallbackOrder` automatically: `adapt-template` → `compose-widgets` → `compose-components` → `create-with-wakecore`. A low-confidence or no-match result is a routing decision, not a blocker.

### 2. Create the implementation plan

Before editing, call `create_implementation_plan` with the user's full `intent`, the returned `strategy`, the implementation goal, and the selected/nearest `template` ID when one exists. Treat the returned plan and artifact contract as mandatory.

Before implementing, record an artifact utilization map that covers every required and recommended plan artifact. For each entry include its catalog ID or export, expected tier, intended screen/region, and status (`required`, `recommended`, `substituted`, or `not-applicable`). In `adapt-template` mode, also record every changed template region in a substitution map with the original region/artifact, replacement artifact, and rationale. Do not silently replace or omit a required artifact.

For an application with more than one route, plan the shared shell before individual screens. Record a route/region map with each route's intent, required regions, required interactions, assigned WakeCore artifacts, and module-boundary ID when applicable. For screenshot work, each region must also name its owner artifact, supported variant, density/state, surface owner, scroll owner, interaction owner, required capabilities, preserved reference traits, and traits intentionally replaced by WakeCore. Record a normative shell fingerprint containing the shell ID, sidebar/top-bar artifact IDs, paired density, brand key, navigation fingerprint, footer fingerprint, provider owner, and allowed route mutations. Selecting either `CoreAppSidebar` or `CoreAppTopBar` requires the other at the same density. Use that stable WakeCore sidebar and top bar across routes unless the plan declares an intentional second-product module boundary with its own complete fingerprint and route list. Route-local branding, navigation, density, or provider swaps are shell drift, not implicit module boundaries. A reference image may guide hierarchy and density, but its brand, palette, and locally reconstructed controls never override WakeCore identity or a catalog artifact unless the user explicitly requires that brand.

Full application shells must use one contiguous viewport-owned layout: `height: 100dvh; overflow: hidden` on the shell and `min-height: 0; overflow: auto` on the route-content owner. The sidebar remains stationary, the shared top bar begins at the sidebar boundary, and page padding belongs inside route content below the top bar. Record navigation semantics for every back affordance; peer sidebar destinations do not receive fabricated back buttons. A chat region has one history/composer owner. A canvas region must declare functional capabilities such as pan, pointer-centered zoom, fit-to-view, reset, selection, keyboard behavior, and—when editing is implied—node movement and connections.

Verify that the plan preserves the fallback order, identifies allowed primitives and forbidden manual recreations, and sets a completion gate matching the selected validation mode. If the plan cannot be created, stop without implementation edits and report the failure.

### 3. Prepare the workspace

After stages 1 and 2 pass, create or repair the React/TypeScript setup before implementing the approved UI:

- If the workspace is empty and the user requested an application, scaffold a React + TypeScript app in the workspace root. Prefer the user's requested toolchain; otherwise use the current stable Vite React TypeScript template.
- If the workspace contains an unrelated project and the user requested a new standalone app, create it in a clearly named subdirectory such as `wakecore-app/` instead of overwriting existing files.
- If React or TSX configuration is missing from an existing JavaScript app, add the minimum compatible TypeScript/React setup without replacing its build system.
- Select the package manager from the existing lockfile. If there is no lockfile, use an available standard package manager and create its lockfile.
- Configure the WakeCap scope without committing a secret:

```ini
@wakecap:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

- Install `@wakecap/core-ui`, `@wakecap/core-tokens`, and `@wakecap/core-utils`. Reuse `NODE_AUTH_TOKEN` when it is already exported. When it is absent but the GitHub CLI is authenticated, obtain `gh auth token` only for the scoped install process; never print, log, or write the token value.
- Import `@wakecap/core-ui/styles.css` from the application entry point unless the existing app already uses a documented WakeCore Tailwind integration.
- When `workspaceRequirements.runtimeAudit.required` is true, install its required dev dependencies, add its declared `audit:runtime` package script, provide `scripts/wakecore-runtime-audit.mjs`, and verify the command can start. A missing audit command or harness leaves workspace preparation incomplete.
- Verify the app typechecks before replacing the starter screen.

Attempt safe setup instead of asking the user to initialize the project manually. If setup fails because package credentials, network access, filesystem permission, or an incompatible existing build is genuinely unavailable, stop and report the exact failed setup step and recovery action. Never embed a token or silently fall back to another component library or standalone HTML/CSS.

### 4. Implement the approved plan

Implement only after stages 1 through 3 pass.

- In `direct-template` mode, use the selected template's exact `@wakecap/core-ui` import/export and preserve its owned layout.
- In `adapt-template` mode, call `resolve_widgets` for the nearest template, preserve useful structure and interaction patterns, and implement the recorded substitution map.
- In `compose` mode, use the plan's composition candidates, `search`, and `resolve_component` to define and build the required widgets and components.
- If the catalog has no suitable widget/component, create the missing application-level UI with WakeCore primitives, providers, tokens, spacing, typography, states, accessibility behavior, interaction patterns, and look and feel. This is the final supported fallback, not a reason to block.
- Use WakeCore tokens and components throughout every mode.
- Use existing semantic tokens according to their documented role. Verify every token name exists; do not create `--ref-color-*` aliases, remap semantic text/background/border roles to unrelated palette colors, wrap complete color tokens in `hsl()`, `rgb()`, or `oklch()`, or place raw color literals in CSS, TS/TSX chart configuration, SVG props, or JavaScript theme objects.
- Style catalog artifacts only through documented props, variants, slots, and public wrapper classes. Do not target owned descendants with wrapper-child selectors or `[data-slot]`, `[data-sidebar]`, `[data-state]`, or `[role]` selectors. Do not combine page-level `Tabs` styling with role/state overrides to invent a hybrid navigation variant; use the catalog's contextual navigation artifact such as `CoreContextTabs` when applicable.
- Read each selected artifact's machine-readable `ownership` contract before composing it. Do not duplicate an artifact-owned background, border, height, padding, or scroll boundary in its wrapper. `CoreAppTopBar` owns its height, background, horizontal padding, and bottom divider; place it directly in the shell without another bordered header strip.
- Use `PageContentHeader` for route-local avatar/title/meta/status/peer-navigation/priority-action headers and `ContextToolbar` for compact icon/title/status/action rows. `CoreDashboardHeader` is the full dashboard shell header with organization/project switching, search, notifications, user identity, and context tabs; do not select it as a generic route header. Preserve the artifacts' responsive atomic groups and never apply `gap-*` to an element that is not a flex or grid container.
- `ViewTabBar` is transparent by default for underline tabs inside a header; request `surface="card"` only when it owns a standalone filled surface. For ECharts, use `createThemedChartOption` or `TrendChart.seriesThemes` with semantic tones/chart indexes; do not send unresolved `var(...)` or `oklch(...)` strings to canvas color fields.
- Do not wrap `DataTable` in an extra `Card` when it already owns its surface, repaint DataTable `table`/`th`/`td` descendants, repaint chart roots, or override tab backgrounds to simulate a missing variant. Select documented variants or record a catalog gap.
- Use one region-owning chat artifact, or lower-level message primitives plus one composer; duplicate composers are blocking. Never render a complete `CoreAiChat` and a second `PromptInput` for the same purpose.
- Rendering `ZoomTools` over absolutely positioned cards is not a canvas. Use a functional WakeCore canvas/template; when no suitable artifact exists, record a catalog gap and wrap an approved canvas engine with WakeCore nodes, controls, tokens, focus states, and panels.
- Do not introduce a standalone HTML/CSS fallback, a parallel page shell, a hidden or unreachable showcase artifact, or a locally re-created version of a catalog artifact.
- Mark the rendered shell and route regions with `data-wakecore-shell` and `data-wakecore-region` so the runtime audit can verify continuity and ownership. Expose the planned shell fingerprint using `data-wakecore-artifact`, `data-wakecore-density`, `data-wakecore-brand`, `data-wakecore-navigation-fingerprint`, and `data-wakecore-provider-owner`; mark route scrolling with `data-wakecore-content-scroll`. Mark owned surfaces with `data-wakecore-surface-owner`, duplicate-sensitive controls with `data-wakecore-affordance-purpose`, navigation controls with `data-wakecore-navigation-purpose` and `data-wakecore-navigation-relationship`, and functional canvases with `data-wakecore-canvas-capabilities` plus observable state evidence. Mark planned controls with `data-wakecore-interaction="<interaction-id>"` and at least one internal link per route with `data-wakecore-route-link`. Use router-aware links; do not replace route transitions with `window.location`, forced reloads, or parallel shells.

Keep the artifact utilization map and, when applicable, the substitution map synchronized with the final implementation. Every substitution must identify the route, region, requested capability, attempted catalog artifacts in fallback order, selected replacement, and reason. If no catalog artifact applies, record a catalog gap before composing application-level UI. If implementation reveals a missing React, TSX, package, or style prerequisite, return to stage 3 and repair it before continuing. If a catalog export is unavailable, move to the next fallback step and record the substitution; do not continue in another stack.

### 5. Validate the finished implementation

Before reporting completion, call `validate` using the selected goal-specific mode. Send the complete implementation through `files`: all application-authored TS/TSX implementation files, relevant CSS/style files, route definitions, and the application entry point. Use legacy `code` only when an older installed server does not accept `files`. Include `implementationPlan` with the returned `planId` and `contractVersion` when present, the goal, implementation mode, selected/reference template, application/artifact contract, route/region map, and structured `substitutions` for `adapt-template`. Pass `template` whenever the selected validation mode requires it.

For contract v2 product, showcase, and screenshot-reproduction plans, run `pnpm audit:runtime -- --url <app-url> --plan <plan.json> --out <evidence.json>` after the app is available. Pass the generated `runtimeAudit` v4 evidence to `validate`. The audit must cover every planned route and region at desktop and 820px narrow viewports, exercise every required interaction, compare each route's runtime shell fingerprint with the contract, prove persistent shell DOM identity outside declared module boundaries, scroll a long route to prove the sidebar remains stationary and route content owns scrolling, verify a contiguous zero-gutter shell boundary, detect duplicate surface dividers and visible affordances, catch horizontal overflow, overlapping or split responsive groups, unreadable identity width, and unlabeled icon actions, verify browser-history and back-navigation semantics, collect console/accessibility errors, inspect DataTable/chart/tab/top-bar owned computed visuals, and prove that canvas controls change real viewport/model state. Missing, unrunnable, stale, or mismatched runtime evidence is blocking; static imports and screenshots do not replace it.

The inventory must distinguish artifacts that are imported, rendered, and visibly exercised. Do not count an import alone as utilization.

Completion is allowed only when the response is successful and `data.compliant` is exactly `true` for the selected mode, with no blocking finding. Review the returned compliance level, per-category scores, artifact coverage, blocking findings, and advisory findings. If validation fails, fix the findings within the selected strategy, update the evidence maps, and call `validate` again. Never hide, waive, or reinterpret a failed completion gate.

In the final response, report:

- The implementation goal, implementation mode, validation mode, and selected/reference template.
- The final artifact utilization map and any adapt-template substitutions.
- The imported/rendered/exercised WakeCore inventory.
- The returned compliance level, detailed category scores, token provenance, CSS ownership, route/runtime coverage, artifact coverage, and blocking/advisory findings.
- For screenshot work, report reference fidelity and WakeCore fidelity separately, including intentional differences from the reference.
- That validation returned `compliant=true`, when it truthfully did.

If any required output is unavailable from the installed server version, identify it as a migration limitation rather than inventing a value. If successful goal-specific compliance cannot be stated truthfully, report the actual setup, MCP, or validation blocker instead of claiming completion.

## Review-only tasks

For a UI review, still run `resolve_template` first to establish the expected artifact, select the goal-specific validation mode, and validate the complete available TS/TSX, CSS, and entry-point file set. Do not modify files unless the user requested changes.
