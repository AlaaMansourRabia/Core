---
name: core-ui-composition
description: >
  Choosing and composing @core/core-ui components: which overlay / action /
  input / data / navigation / feedback component to use WHEN, required
  provider/ancestor wiring, valid nesting, variant semantics, and end-to-end
  workflow recipes (app shell, dashboard page, form-in-dialog, template-gallery
  dialog, data view with filters). Load when deciding WHICH component to reach
  for or HOW to assemble several Core components into a screen. The
  machine-readable catalog lives in library-index.json (per-component intent /
  when / chooseOver / requires / variantIntent).
metadata:
  type: reference
  library: core
  library_version: "0.0.1"
sources:
  - "core/Core:library-index.json"
  - "core/Core:packages/components/src/dialog.tsx"
  - "core/Core:packages/components/src/sheet.tsx"
  - "core/Core:packages/components/src/popover.tsx"
  - "core/Core:packages/components/src/dropdown-menu.tsx"
  - "core/Core:packages/components/src/button.tsx"
  - "core/Core:packages/components/src/data-table.tsx"
  - "core/Core:packages/components/src/navigation/core-app-sidebar.tsx"
  - "core/Core:packages/components/src/navigation/core-app-top-bar.tsx"
---

# @core/core-ui — Composition & Component Selection

This skill is the **why/when** layer. For one component's full API and failure
modes, load its domain skill (`core-ui-components`, `core-ui-forms`,
`core-ui-data-table`, `core-ui-charts`). Load this skill when you must **choose
between overlapping components** or **assemble several into a screen**.

The same guidance is machine-readable in **`library-index.json`** — each
component carries `intent`, `when`, `chooseOver`, `requires`, `pairsWith`,
`variantIntent`, and a short `avoid`, with a `knowledgeLevel` of
`full | concise | generated`. Deep wrong/correct code stays in
`skills/_artifacts/domain_map.yaml` failure modes (referenced as `fm-*`).

## Component Selection Guides

### Overlays

- **Dialog** — a focused modal task that blocks until completed/dismissed.
- **AlertDialog** — a _destructive/irreversible_ confirmation that forces an explicit choice (no outside-click dismissal).
- **Sheet** — an edge-anchored panel for contextual work beside the page; `side`: right=details, left=nav, top=announce, bottom=(prefer Drawer on touch).
- **Drawer** — the touch/mobile bottom sheet (drag-to-dismiss).
- **Popover** — lightweight anchored content / a short form; dismisses on outside click.
- **Tooltip** — hover _label_ for an icon or terse control. **Requires `TooltipProvider`.** Never put interactive content inside it.
- **HoverCard** — hover _preview_ of richer (read-only) content.
- **DropdownMenu** — a list of actions/commands from an explicit trigger.
- **ContextMenu** — the same menu opened by right-click on a target.
- **Menubar** — a persistent application menu strip (File/Edit/View).

Prefer **Sonner** (toast) over Dialog/Alert for transient confirmations. Prefer
**Select** over DropdownMenu when picking a _form value_ (DropdownMenu invokes
actions).

### Actions

- **Button** — actions. For navigation use `Button asChild` wrapping a router Link — **never navigate via `onClick`**. Variants: `default` (primary, one per view), `destructive` (delete), `outline` (secondary), `secondary` (low emphasis), `ghost` (toolbar/icon), `link` (inline text action — not for real `<a>` navigation).
- **ButtonGroup** — join discrete related actions visually.
- **Toggle / ToggleGroup** — a pressed-state control / a segmented value picker. Use **Tabs** to switch views, **RadioGroup** for a form field, **Switch** for an instant setting.

### Inputs (forms)

- **Input** (single line) vs **Textarea** (multi-line) vs **InputOTP** (codes).
- **Select** (short known list) vs **Combobox** (long, type-to-filter) vs **RadioGroup** (few, all visible).
- **Checkbox** (form selection / opt-in, submitted with the form) vs **Switch** (a setting applied immediately).

### Data

- **Table** — presentational, semantic `<table>`; static rows, full layout control.
- **DataTable** — TanStack-Table grid with sorting/filtering/pagination/selection/expansion. Reach for it past ~10 rows or any interactivity. Its `searchKey` must equal a column `accessorKey` (fm-dt-1).

### In-component views vs page navigation

- **Tabs** — switch peer views in the same area (one visible at a time).
- **Accordion** — stacked sections that can be open together; **Collapsible** — a single show/hide region.
- **CoreContextTabs** — page-level section nav under the top bar (Overview/Schedule/Quality).
- **NavigationMenu** — link-based site nav; **Breadcrumb** — location in a hierarchy.

### Navigation / app shell

- **CoreAppSidebar + CoreAppTopBar** — the standard Core product shell. Use these for any normal product screen.
- **Sidebar** (primitive) — only when building a _bespoke_ sidebar from scratch.

### Feedback

- **Alert** — persistent inline message tied to a section (`default`=info, `destructive`=error).
- **Sonner** — transient auto-dismiss toast (Saved/Copied/Failed). **Requires a single `<Toaster/>` mounted at the root.**
- **Empty** — loaded-but-no-data zero state; **Skeleton** — while loading; **ErrorPage** — route-level failures (404/500/permission).

## Composition Rules

| Rule                                                             | Why                                                                           | Source                                                    |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------- |
| `SidebarProvider` wraps the **root** layout, never nested        | sidebar state is one context for the shell                                    | `packages/components/src/sidebar.tsx` (fm-prim-3)         |
| One `TooltipProvider` near the root covers all tooltips          | every `Tooltip` needs the provider ancestor                                   | `packages/components/src/tooltip.tsx` (fm-prim-2)         |
| `FormField` only inside a `Form` + `useForm` context             | fields read form context for validation/state                                 | `packages/components/src/form.tsx` (fm-form-2)            |
| Mount a single `<Toaster/>` (Sonner) at the root                 | toasts render into that portal; missing it = silent no-op                     | `packages/components/src/sonner.tsx`                      |
| Don't open a `Dialog` from inside a `DropdownMenu` item directly | focus-trap conflict — close the menu first, then open the Dialog              | `packages/components/src/dropdown-menu.tsx`               |
| `CoreAppSidebar` selection is route-driven via `activeItemId`    | keeps the highlight in sync with the host router (esp. collapsed rail/flyout) | `packages/components/src/navigation/core-app-sidebar.tsx` |

## Workflow Recipes

### App shell

```tsx
import {SidebarProvider} from "@core/core-ui/sidebar";
import {TooltipProvider} from "@core/core-ui/tooltip";
import {CoreAppSidebar} from "@core/core-ui/navigation/core-app-sidebar";
import {CoreAppTopBar} from "@core/core-ui/navigation/core-app-top-bar";

<TooltipProvider>
	<SidebarProvider>
		{" "}
		{/* root only */}
		<div className="wwc:flex wwc:h-screen">
			<CoreAppSidebar activeItemId={routeId} onNavigate={navigate} />
			<main className="wwc:flex-1 wwc:flex wwc:flex-col wwc:border-l">
				<CoreAppTopBar selectedProject={project} onSelectProject={setProject} />
				{/* page content */}
			</main>
		</div>
	</SidebarProvider>
</TooltipProvider>;
```

Order: provider(s) → sidebar → main → top bar → content. Drive selection with `activeItemId`, not DOM clicks.

### Dashboard page

App shell → a `Card` grid of KPIs (`Card` + `Badge`) → `Chart` panels → `Skeleton`
while loading, `Empty` when there's no data.

### Form in a dialog

```tsx
<Dialog open={open} onOpenChange={setOpen}>
	<DialogContent>
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<FormField name="name" /* ... */ />
				<DialogFooter>
					<Button variant="outline" onClick={() => setOpen(false)}>
						Cancel
					</Button>
					<Button type="submit">Save</Button>
				</DialogFooter>
			</form>
		</Form>
	</DialogContent>
</Dialog>
```

Submit via `form.handleSubmit`; close the Dialog on success.

### Template-gallery dialog

`Dialog` → `SearchFilterBar` (filter) → a grid of `Card`s in a `ScrollArea` → on
select, swap the **same** `DialogContent` to a detail view with a Back button.
One view-state toggles list ↔ detail.

### Data view with filters

`SearchFilterBar` → `DataTable` (columns + sorting/filtering) → pagination. Keep
`searchKey` equal to the column `accessorKey` (fm-dt-1).

## Variant Semantics

- **Button** `variant`: see Actions above. `size`: `default` / `sm` / `lg`; the `icon` boolean makes a square icon button.
- **Sheet** `side`: right=details (default), left=nav, top=announce, bottom=prefer Drawer on touch.
- **Alert** `variant`: `default`=info, `destructive`=error.
- **Badge** `variant`: `default`=neutral, `secondary`=muted, `destructive`=error, `outline`=subtle.
- **Tabs** `variant`: `default`=boxed, `underline`=minimal.
- **CoreAppSidebar** `density`: `comfortable` (default) / `compact` (denser long nav); `collapsed` → icon rail with sub-tab flyouts.

## See also

- `core-ui-components` — primitive APIs, providers, cn(), cva.
- `core-ui-forms` — Form/Field + react-hook-form + zod.
- `core-ui-data-table` — DataTable columns, sorting, filtering, expansion.
- `core-ui-charts` — ChartContainer vs ChartRenderer.
- `library-index.json` — the machine-readable semantic catalog (`intent`/`when`/`chooseOver`/`requires`/`variantIntent` per component, `patterns[]` recipes).
