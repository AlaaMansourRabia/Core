# Storybook Lessons Learned

Patterns, pitfalls, and fixes discovered while implementing 97 stories across all component categories and configuring tooling.

---

## Story Authoring

### Controlled components need useState wrappers

Controlled components (Combobox, Calendar, DatePicker) must be wrapped with `useState` in story render functions. Without state management, selecting a value fires the callback but the UI never updates — Storybook `args` don't manage React state.

```tsx
// Wrong — value never updates after selection
export const Default: Story = {
	args: {options, placeholder: "Select..."},
};

// Correct — useState manages the selection
export const Default: Story = {
	render: () => {
		const [value, setValue] = useState("");
		return <Combobox options={options} value={value} onValueChange={setValue} />;
	},
};
```

### Calendar requires mode prop

The `<Calendar>` component (react-day-picker) renders plain `<td>` text without buttons when no `mode` prop is set. The `w-9 h-9` sizing is on `day_button` classNames which only apply to `<button>` elements. Without `mode`, day cells collapse to ~7px text width.

```tsx
// Wrong — days collapse
<Calendar className="rounded-md border" />

// Correct — buttons render with proper sizing
<Calendar mode="single" className="rounded-md border" />
```

### Timeline components are siblings, not nested

`TimelineTrack`, `TimelineEvents`, `TimelineTodayMarker` are **siblings** inside a wrapper div — NOT children of `TimelineTrack`. Same for `TimelineHistogram` and `TimelineRanges`.

```tsx
// Wrong — nesting inside TimelineTrack
<TimelineTrack>
  <TimelineEvents events={events} />
</TimelineTrack>

// Correct — siblings inside a wrapper div
<div className="relative py-4">
  <TimelineTrack tickInterval="week" />
  <TimelineEvents events={events} />
  <TimelineTodayMarker />
</div>
```

### Always check apps/web before writing stories

The demo app in `apps/web/` is the source of truth for component usage patterns, data structures, and composition. Writing stories from component source alone leads to incorrect composition (e.g., the Timeline nesting issue). Read the corresponding demo page first and replicate its data, props, and layout patterns.

### Zod v4 API changes

Zod 4 changed `z.string({required_error: "..."})` to `z.string({message: "..."})`. Use `z.string({message: "..."}).min(1, "...")` for required string validation.

---

## Interaction Tests (Play Functions)

### Always use waitFor for async assertions

Assertions that check state after user interactions must be wrapped in `waitFor()`. This is critical for Chromatic where rendering is slower than local dev.

```tsx
// Wrong — assertion may run before re-render
await userEvent.click(option);
await expect(trigger).toHaveTextContent("Vue");

// Correct — waits for state update
await userEvent.click(option);
await waitFor(() => expect(trigger).toHaveTextContent("Vue"));
```

### Carousel buttons need pointerEventsCheck: 0

Carousel navigation buttons use absolute positioning (`-left-12`, `-right-12`) outside the container. In Chromatic's capture environment, these get `pointer-events: none`.

```tsx
await userEvent.click(nextButton, {pointerEventsCheck: 0});
```

Also avoid assertions on Embla's scroll state (disabled buttons) — it doesn't initialize reliably in headless environments. Keep carousel interaction tests simple: verify buttons exist and clicks don't throw.

---

## Chromatic & CI

### Publish to Chromatic before committing

Verify stories pass in Chromatic before creating a git commit. This catches interaction test failures and rendering issues that only appear in Chromatic's headless environment.

**Workflow:** Build → Publish to Chromatic → Fix errors → Re-publish → Commit when clean.

### Map stories need disableSnapshot

Map tiles load asynchronously from Mapbox and produce non-deterministic renders. Add to all map story meta:

```tsx
parameters: {
  chromatic: { disableSnapshot: true },
},
```

### Mapbox token via environment variable

Store as `VITE_MAPBOX_TOKEN` in `.env` (gitignored) for local dev. Add as GitHub Actions secret for CI. Reference via `import.meta.env.VITE_MAPBOX_TOKEN` in stories. Both `ci.yml` and `chromatic.yml` need the env var on the Storybook build step.

### Commit message header max 100 characters

Commitlint enforces `header-max-length: 100`. Keep subjects concise and list component details in the body.

### Chromatic fails CI on visual changes by design

The Chromatic GitHub Action is configured with `exitZeroOnChanges: false`. When visual changes are detected, the action exits with code 1 and blocks the pipeline. This is intentional — it forces review before merging.

For large intentional changes (e.g., a CSS prefix migration that changes class names but not appearance), the workflow is:

1. Push to trigger the Chromatic build
2. CI fails with "Found N visual changes"
3. Review the changes in the Chromatic UI and accept them
4. Re-run the CI pipeline — it passes because the baseline is now updated

Do NOT change `exitZeroOnChanges` to `true` to work around this. If the visual changes are intentional, accept them in Chromatic. If they're not, fix the code.

### oxfmt requires per-package .gitignore to skip dist/

Oxfmt uses `.gitignore` for ignore patterns but only reads it from the directory where it runs (`oxfmt --check .`). In a monorepo, the root `.gitignore` has `dist` but oxfmt runs from each package directory. Without a per-package `.gitignore`, `dist/` build artifacts get scanned and fail `format:check`.

Fix: add a `.gitignore` with `dist` to every package and app that has a `format:check` script:

```
# packages/components/.gitignore, packages/utils/.gitignore, apps/web/.gitignore, apps/storybook/.gitignore
dist
```

This only matters when `build` runs before `format:check` (which happens in CI).

---

## Migration Notes

### ECharts replaced Recharts

The chart system was migrated from Recharts to ECharts. Key changes:

| Before (Recharts)                           | After (ECharts)                           |
| ------------------------------------------- | ----------------------------------------- |
| `ChartContainer` + `ResponsiveContainer`    | `ChartContainer` wraps `ReactECharts`     |
| `ChartTooltip`, `ChartLegend` components    | ECharts `option.tooltip`, `option.legend` |
| `<Bar dataKey="x" fill="var(--color-x)" />` | `series: [{ type: "bar", data: [...] }]`  |
| CSS var injection via `ChartStyle`          | `useChartTheme()` hook returns colors     |

When writing chart stories, use the `useChartTheme()` hook and build ECharts `option` objects with `useMemo`.

---

## MDX Documentation

### Markdown pipe tables don't render in Storybook 10 MDX

Storybook 10's MDX processor doesn't parse markdown pipe tables (`| Header |`) correctly — they render as raw text. Convert all tables to HTML `<table>` elements instead.

```mdx
{/* Wrong — renders as raw text */}
| Component | Description |
|-----------|-------------|
| **Button** | Primary interactive element |

{/* Correct — renders as a proper table */}

<table>
	<thead>
		<tr>
			<th>Component</th>
			<th>Description</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>
				<strong>Button</strong>
			</td>
			<td>Primary interactive element</td>
		</tr>
	</tbody>
</table>
```

### Color swatches in MDX via exported components

Export a small JSX component from the MDX file to render inline color previews alongside code values. Uses OKLCH color values directly in `backgroundColor` — modern browsers support them natively.

```mdx
export const ColorSwatch = ({color}) => (
	<span style={{display: "inline-flex", alignItems: "center", gap: "8px"}}>
		<span
			style={{
				display: "inline-block",
				width: "16px",
				height: "16px",
				borderRadius: "4px",
				backgroundColor: color,
				border: "1px solid rgba(0,0,0,0.1)",
			}}
		/>
		<code>{color}</code>
	</span>
);

<td>
	<ColorSwatch color="oklch(0.577 0.245 27.325)" />
</td>
```

---

## Story Quality

### Always set `component` on meta for autodocs

Every story file should have `component: X` on the meta object. This enables Storybook autodocs to generate a prop table automatically. Even compound components benefit — set it to the root component (e.g., `component: Accordion`, `component: Dialog`).

```tsx
// Wrong — no prop table generated
const meta = {
	title: "Layout/Accordion",
	tags: ["autodocs"],
} satisfies Meta;

// Correct — autodocs generates prop table for Accordion
const meta = {
	title: "Layout/Accordion",
	component: Accordion,
	tags: ["autodocs"],
} satisfies Meta<typeof Accordion>;
```

### Use story-level wrapper components for complex visualizations

Charts and maps that use imperative APIs (ECharts options, mapboxgl) should be wrapped in a story-level component that exposes simplified props as `argTypes`. This makes the Storybook controls panel interactive.

Set `component` to the **real library component** (not the wrapper) so the MCP addon can resolve the import path, and use `render` to delegate to the wrapper.

```tsx
// Story-level wrapper with exposed args
function BarChartStory({ stacked, horizontal, showLegend }: BarChartProps) {
  const { colors, textColor, borderColor } = useChartTheme();
  const option = useMemo(() => buildOption(...), [...]);
  return <ChartContainer option={option} style={{ height: 300 }} />;
}

const meta = {
  component: ChartContainer, // real library component for MCP snippet generation
  argTypes: {
    stacked: { control: "boolean" },
    horizontal: { control: "boolean" },
  },
  render: (args: BarChartProps) => <BarChartStory {...args} />,
} satisfies Meta;
```

If `component` points to a local function (e.g., `component: BarChartStory`), the MCP addon fails with **"Could not generate snippet without component name"** because it can't produce an import statement for a file-local function.

### Imperative APIs (Toast/Sonner) can still be args-driven

For hook-driven components, pass args to the imperative function call so consumers can tweak values from the controls panel.

```tsx
export const Default: Story = {
	args: {title: "Saved", description: "Your changes were saved.", variant: "default"},
	render: (args) => {
		const {toast} = useToast();
		return <Button onClick={() => toast(args)}>Show Toast</Button>;
	},
};
```

### Set Welcome as the default page

Use `storySort` in `preview.ts` to control sidebar ordering and ensure the Welcome page loads first.

```tsx
parameters: {
  options: {
    storySort: {
      order: ["Welcome", "Overview", "Design Tokens", "Dark Mode", "Theme", "Examples", "*"],
    },
  },
},
```

---

## MCP Addon & Component Manifest

### Manifest dashboard

The MCP addon exposes a manifest dashboard at `http://localhost:6006/manifests/components.html` that reports prop type errors, story errors, and missing descriptions across all components. Use `#filter-errors` / `#filter-story-errors` / `#filter-infos` anchors to filter by category.

### tsconfig paths required for monorepo source resolution

The manifest generator uses `tsconfig-paths` + Node.js `resolve` to locate component source files for prop type extraction. In a monorepo where stories import from the package name (e.g., `@core/core-ui/accordion`), the default resolution lands on `dist/*.mjs` — compiled files that react-docgen can't parse.

Fix: add `baseUrl` and `paths` to the storybook tsconfig so the generator resolves to source `.tsx` files:

```json
{
	"compilerOptions": {
		"baseUrl": "../..",
		"paths": {
			"@core/core-ui/*": ["packages/components/src/*"]
		}
	}
}
```

Without this, every component shows **"No component file found"** prop type errors.

### Package exports should include `source` field

Add `"source"` entries to `package.json` exports alongside `"types"` and `"import"`. This helps tools that support the `source` condition (Vite with `resolve.conditions`, Turbopack) resolve directly to `.tsx` source files.

```json
"./accordion": {
  "source": "./src/accordion.tsx",
  "types": "./dist/accordion.d.mts",
  "import": "./dist/accordion.mjs"
}
```

### Radix root re-exports need forwardRef wrappers

React-docgen cannot extract JSDoc descriptions from plain re-assignments like `const Dialog = DialogPrimitive.Root` — it doesn't recognize property access expressions (`Y.Z`) as component definitions. Direct identifier assignments (`const Form = FormProvider`) work fine.

Fix: wrap in `React.forwardRef` so react-docgen can parse the definition:

```tsx
// Wrong — react-docgen ignores JSDoc on property access re-exports
/** Description */
const Dialog = DialogPrimitive.Root;

// Correct — react-docgen extracts JSDoc from forwardRef
/** Description */
const Dialog = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>
>((props, ref) => <DialogPrimitive.Root ref={ref} {...props} />);
Dialog.displayName = "Dialog";
```

### JSDoc on component source drives manifest descriptions

The manifest "info" messages ("No description found") come from missing JSDoc comments on the **component source file**, not the story file. The story's `parameters.docs.description.component` is only used for the Storybook docs page — it does not feed into the MCP manifest.

```tsx
// In packages/components/src/button.tsx — this is what the manifest reads
/** An interactive element that triggers an action when clicked. */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(...);
```

---

## Theming & Dark Mode

### storybook-dark-mode addon doesn't work with Storybook 10

The `storybook-dark-mode` package (v5) uses the old `managerEntries` API which Storybook 10 no longer loads. The toolbar toggle never appears.

Fix: use Storybook's native `globalTypes` + a decorator instead:

```tsx
// preview.ts
globalTypes: {
  theme: {
    description: "Toggle between light and dark mode",
    toolbar: {
      title: "Theme",
      icon: "moon",
      items: [
        { value: "light", icon: "sun", title: "Light" },
        { value: "dark", icon: "moon", title: "Dark" },
      ],
      dynamicTitle: true,
    },
  },
},
decorators: [
  (Story, context) => {
    const isDark = context.globals.theme === "dark";
    document.documentElement.classList.toggle("dark", isDark);
    document.body.style.backgroundColor = isDark
      ? "oklch(0.145 0 0)" : "oklch(1 0 0)";
    return Story();
  },
],
```

### Tailwind 4 class-based dark mode needs @custom-variant

The design tokens use `.dark` class selector for CSS variable overrides, but Tailwind 4 `dark:` utility classes won't activate without declaring the variant. Add this to `@core/core-tokens` (not per-app) so all consumers get it:

```css
@custom-variant dark (&:where(.dark, .dark *));
```

Without this, components using `dark:` prefix classes (e.g., `dark:border-destructive` in Alert) won't switch in dark mode.

### Sync manager theme with toolbar toggle

The decorator handles the preview iframe, but the Storybook manager (sidebar, toolbar, panels) needs separate syncing via `manager.ts`:

```ts
addons.register("core/theme-sync", (api) => {
	const channel = api.getChannel();
	channel.on("updateGlobals", () => {
		const theme = api.getGlobals()?.theme || "light";
		addons.setConfig({
			theme: theme === "dark" ? coreDark : coreLight,
		});
	});
});
```

### Manager fonts must be loaded separately

The Storybook manager UI runs outside the preview iframe, so it does not inherit fonts from `preview.css` or `@core/core-tokens`. Import Google Fonts directly in `manager.css`:

```css
@import url("https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&family=IBM+Plex+Mono:ital,wght@0,400;0,500;0,600;1,400&display=swap");

body,
[class*="sidebar"],
[class*="Sidebar"] {
	font-family: Figtree, ui-sans-serif, sans-serif, system-ui;
}
```

Without this, the manager falls back to system fonts even though the theme config specifies Figtree — the font file isn't loaded in the manager context.

---

## Linting & Formatting

### Oxlint rules may not exist in your installed version

Oxlint is actively developed and rule availability varies between versions. If `.oxlintrc.json` references rules that don't exist in the installed version, **all projects fail** with a config build error — not just a single rule warning.

In v1.60.0, `jsx-a11y/button-has-type` and `jsx-a11y/interactive-supports-focus` don't exist. The error message is:

```
Failed to build configuration from .oxlintrc.json.
× Rule 'button-has-type' not found in plugin 'jsx_a11y'
```

Fix: remove unsupported rules from the config. Check available rules with `npx oxlint --rules` or the [Oxlint rules reference](https://oxc.rs/docs/guide/usage/linter/rules.html).

### Storybook render functions trigger false-positive rules-of-hooks errors

Storybook's `render: () => { ... }` pattern in story objects uses hooks inside anonymous arrow functions. Oxlint (and ESLint) flag these as `react-hooks/rules-of-hooks` violations because the function is anonymous — not recognized as a React component.

```tsx
// This is valid Storybook usage but oxlint flags it as an error
export const Default: Story = {
	render: () => {
		const [value, setValue] = useState(""); // "Hook called in non-component function"
		return <Combobox value={value} onValueChange={setValue} />;
	},
};
```

Fix: create a local `.oxlintrc.json` in `apps/storybook/` that extends the root config and disables the rule for the storybook app only:

```json
{
	"$schema": "../../node_modules/oxlint/configuration_schema.json",
	"extends": ["../../.oxlintrc.json"],
	"rules": {
		"react-hooks/rules-of-hooks": "off"
	}
}
```

This keeps the rule enforced in `packages/components`, `packages/utils`, and `apps/web` where false positives don't occur.

### Always run formatting after bulk changes

Oxfmt (`pnpm format`) should be run after any bulk code changes — new stories, refactors, dependency updates. The formatter enforces tabs, double quotes, trailing commas, import sorting, and 120-char width. Without it, inconsistent formatting accumulates and creates noisy diffs later.

**Workflow:** Make changes → `pnpm format` → `pnpm lint` → `pnpm typecheck` → fix errors → commit.

### Radix Root components are providers, not DOM elements

Radix UI `Root` components (`DialogPrimitive.Root`, `AlertDialogPrimitive.Root`, `PopoverPrimitive.Root`, etc.) are React context providers — they don't render a DOM element and don't accept `ref`. Wrapping them in `React.forwardRef` causes `TS2344` type errors:

```
Type 'FC<AlertDialogProps>' does not satisfy the constraint 'ForwardRefExoticComponent<any>'
Property 'ref' does not exist on type 'IntrinsicAttributes & AlertDialogProps'
```

Fix: use a plain function component instead of `forwardRef`. React-docgen can still extract the JSDoc from function declarations:

```tsx
// Wrong — Root doesn't accept ref
const AlertDialog = React.forwardRef<
	React.ElementRef<typeof AlertDialogPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Root>
>((props, ref) => <AlertDialogPrimitive.Root ref={ref} {...props} />);

// Correct — plain function, no ref
/** A modal dialog that interrupts the user with important content. */
function AlertDialog(props: React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Root>) {
	return <AlertDialogPrimitive.Root {...props} />;
}
```

Affected components: AlertDialog, ContextMenu, Dialog, DropdownMenu, HoverCard, Popover, Sheet, Tooltip. Sub-components that wrap actual DOM elements (Overlay, Content, Trigger) still use `forwardRef` correctly.

### ECharts data from Record<string, unknown> needs explicit casting

When chart data is typed as `Record<string, unknown>[]` (common for AI-generated chart data), accessing values like `data.map(d => d[key])` returns `unknown[]`. ECharts' strict types reject this for `xAxis.data` (expects `string[]`) and `series.data` (expects `number[]`).

Fix: cast at the access point:

```tsx
// Wrong — returns unknown[]
xAxis: {
	data: data.map((d) => d[xAxisKey]);
}
series: [{data: data.map((d) => d[key])}];

// Correct — explicit cast
xAxis: {
	data: data.map((d) => String(d[xAxisKey]));
}
series: [{data: data.map((d) => Number(d[key]))}];
```

---

### Documentation-only pages use !manifest tag

Theme showcase pages (Colors, Font Family, Spacing, Radius) and the Overview page don't have a `meta.component` because they are pure documentation, not component stories. The MCP manifest reports "We could not detect the component" errors for these.

Fix: add `!manifest` tag to exclude them:

```tsx
const meta = {
	title: "Theme/Colors",
	tags: ["autodocs", "!manifest"],
	// no component needed
} satisfies Meta;
```

---

## Tailwind CSS Prefix (`wwc:`)

### All utility classes inside core-ui use the `wwc:` prefix

Core uses Tailwind CSS 4's `prefix(wwc)` feature. Every utility class **inside component source files** is prefixed: `wwc:flex`, `wwc:bg-primary`, `wwc:hover:text-foreground`. This prevents collisions when consumers have their own Tailwind setup.

The prefix is an **internal implementation detail** — consumers never write `wwc:` in their own code. Components are self-styled black boxes. For TW3 consumers, `@core/core-tokens/tailwind3-preset` maps design tokens to unprefixed TW3 utilities.

The prefix is configured in `@core/core-tokens`:

```css
@import "tailwindcss" prefix(wwc);
```

### tailwind-merge must be configured with the prefix

The `cn()` utility in `@core/core-utils` uses `extendTailwindMerge` with the prefix so it correctly resolves conflicts like `wwc:p-4 wwc:p-6` → `wwc:p-6`.

```tsx
import {extendTailwindMerge} from "tailwind-merge";

const twMerge = extendTailwindMerge({
	prefix: "wwc",
});
```

Without this, `twMerge` doesn't recognize `wwc:p-4` as a padding utility and keeps both classes.

### Pre-built CSS — two outputs for different consumers

The library ships two pre-built CSS files, both generated by `scripts/flatten-css.mjs` (PostCSS + cssnano):

| File             | For         | Has reset? | Has `@layer`?  |
| ---------------- | ----------- | ---------- | -------------- |
| `styles.css`     | No-TW / TW3 | Yes        | No (flattened) |
| `styles.tw4.css` | TW4         | No         | Yes (kept)     |

**Why two files:**

- TW3's PostCSS chokes on `@layer` — `styles.css` flattens them out
- TW4 consumers have their own CSS reset — `styles.tw4.css` removes `@layer base` to avoid conflicts
- TW4 understands `@layer` natively — keeping it gives correct cascade ordering

**Import order matters for TW4.** Consumer CSS must load first, component styles after:

```tsx
import "./index.css"; // consumer's TW4 first
import "@core/core-ui/styles.tw4.css"; // component styles after
```

Reversing this makes `@layer` from the pre-built CSS declare before the consumer's layers, giving component utilities lower cascade priority.

**Input validation:** The script validates that the TW4 CLI output contains expected layers (`properties`, `theme`, `base`, `utilities`). If TW4 changes its layer structure in a future version, the build fails loudly.

Fonts are not bundled; consumers load them via a `<link>` tag.

```json
"build:css": "tailwindcss -i src/styles.css -o dist/styles.css && node scripts/flatten-css.mjs"
```

### className overrides don't merge across prefix boundaries

The `cn()` utility uses `tailwind-merge` configured with `prefix: "wwc"`. This means `twMerge` only resolves conflicts between `wwc:`-prefixed classes. When a consumer passes an unprefixed className override to a component, it can't merge:

```tsx
// Consumer passes unprefixed override
<CardContent className="p-4" />

// Inside CardContent: cn("wwc:p-6 wwc:pt-0", "p-4")
// Result: "wwc:p-6 wwc:pt-0 p-4" — both kept, wwc:p-6 wins
// Expected: "wwc:p-4" — override should win
```

**Workaround:** Don't use `CardContent` when you need custom padding. Use a plain `<div>` inside `<Card>`:

```tsx
<Card>
	<div className="p-4">content</div>
</Card>
```

**Long-term fix:** Components should expose props (`padding`, `size`, `compact`) for common customizations instead of relying on `className` merging. This is a known architectural limitation of adding a prefix to the shadcn/ui pattern.

### Codemod pitfalls: content-based class detection has false positives

Automated class prefixing using content-based heuristics (checking if a string "looks like" Tailwind) produces false positives in several categories:

| False Positive | Example                                 | Why It Was Caught                            |
| -------------- | --------------------------------------- | -------------------------------------------- |
| Prop values    | `variant="outline"`                     | `outline` is a TW utility AND a variant name |
| Time strings   | `"12:00 AM"`                            | Colon matched as TW modifier pattern         |
| URLs           | `"mapbox://styles/..."`                 | `mapbox:` matched as modifier                |
| CSS properties | `cursor: pointer;` in template literals | `cursor-` is a TW prefix                     |
| ECharts config | `{type: "shadow"}`                      | `shadow` is in the TW standalone list        |
| SVG attributes | `xmlns="http://www.w3.org/2000/svg"`    | URL with colon                               |
| Data labels    | `{name: "border"}`                      | `border` is a TW utility                     |
| Aspect ratios  | `"16:9"`                                | Colon matched as modifier                    |
| Mapbox GL keys | `"fill-color"`, `"text-field"`          | `fill-`, `text-` are TW prefixes             |

**Lesson:** A content-based codemod needs multiple cleanup passes. Context-aware transformation (only targeting `className`, `cn()`, `cva()` contexts) is more reliable but harder to implement with regex. Run automated scans after each pass to catch regressions.

### Custom props that pass class names need the prefix

Props like `color`, `dotClass`, `iconBg` that are NOT `className` but pass values into a `className` attribute inside the component DO need the `wwc:` prefix. A cleanup script that strips `wwc:` from all non-`className` attributes will incorrectly revert these.

```tsx
// The color prop is used as a className inside StatCard
<StatCard color="wwc:text-orange-600" />

// Inside StatCard:
<p className={`wwc:text-2xl wwc:font-bold ${color}`}>{value}</p>
```

**Lesson:** Before stripping `wwc:` from a prop value, trace where that prop is used inside the component. If it flows into a `className`, keep the prefix.

### Display labels in stories should match the internal class names

When stories show class names as documentation text (e.g., type scale labels, color token labels, spacing patterns), the labels should show the prefixed version since that's what the component source uses internally.

```tsx
// Label matches component source
{class: "wwc:text-xs", size: "12px"}
```

Note: consumers never write `wwc:` — they use standard unprefixed Tailwind classes. The prefix is only visible in component source and story documentation.

Exception: CSS variable names (`--background`, `--primary`) and token names (`border`, `ring`) that are shown as design token documentation should NOT have the prefix — the prefix is on utility classes, not CSS variables.

### Shadow overrides in tokens must target prefixed selectors

The tokens CSS has shadow overrides that target Tailwind utility class selectors directly. With prefix, these must use the escaped colon syntax:

```css
/* Before prefix */
.shadow,
.shadow-sm,
.shadow-md {
	box-shadow: none;
}

/* After prefix */
.wwc\:shadow,
.wwc\:shadow-sm,
.wwc\:shadow-md {
	box-shadow: none;
}
```

### toHaveStyle tests check CSS properties, not class names

The `toHaveStyle("pointer-events: none")` assertion checks the **computed CSS property**, not the Tailwind class name. CSS properties never get the prefix — only class names do. A codemod that prefixes all strings containing colons will incorrectly transform these.

---

## Page Component Stories

### Page components need JSDoc for the MCP manifest

The MCP addon's manifest dashboard flags components as "info" when they lack a JSDoc comment on the exported function. Story-level `parameters.docs.description.component` only affects the Storybook docs page — it does NOT feed into the manifest.

```tsx
// In packages/components/src/pages/core-login-page.tsx
/** Authentication page with email/password form and Core branding. */
export function LoginPage({onLogin}: LoginPageProps) {
```

### Page stories use mock data from the shared data module

All page components accept typed props (`Organization`, `Project`) from `@core/core-ui/types`. Mock data is centralized in `@core/core-ui/data/mock-data`:

```tsx
import {MOCK_ORGANIZATIONS, MOCK_PROJECTS} from "@core/core-ui/data/mock-data";

// Org-level pages
<OrgOverview selectedOrg={MOCK_ORGANIZATIONS[0]} />

// Project-level pages
<ProjectOverview project={MOCK_PROJECTS[0]} />
```

### Render page stories in height-constrained containers

Page components are full-viewport layouts. Without a height constraint, they either collapse or overflow the Storybook canvas. Wrap in a bordered container:

```tsx
render: () => (
	<div className="wwc:h-[800px] wwc:border wwc:rounded-lg wwc:overflow-hidden">
		<OrgOverview selectedOrg={MOCK_ORGANIZATIONS[0]} />
	</div>
),
```
