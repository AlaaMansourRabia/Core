# Storybook 10 Integration — Wakecore Design System

## Overview

Storybook 10 has been integrated into the Wakecore monorepo as the canonical component documentation and testing tool. The existing demo app (`apps/web/`) remains as a playground.

- **Location:** `apps/storybook/`
- **Framework:** `@storybook/react-vite` (Storybook 10.3.5)
- **Hosting + Visual Testing:** Chromatic
- **Story Format:** CSF with `satisfies Meta` pattern
- **Dark Mode:** Toolbar toggle via `storybook-dark-mode`
- **Addons:** a11y, docs, dark-mode (viewport, interactions, controls built into Storybook 10 core)
- **Theme:** Custom WakeCap branding (navy/slate palette, Figtree font)

---

## Quick Start

```bash
pnpm install                  # Install dependencies
pnpm storybook                # Dev server at localhost:6006
pnpm storybook:build          # Production build to apps/storybook/dist
```

---

## What Was Built

| Phase                 | Files                    | Description                                                                                                                                                                                                           |
| --------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Foundation**        | 8 config files           | `package.json`, `.storybook/main.ts`, `preview.ts`, `preview.css`, `manager.ts`, `wakecap-theme.ts`, `tsconfig.json`, `chromatic.config.json`                                                                         |
| **Stories**           | 79 story files           | 78 full stories + 1 placeholder stub across 9 categories                                                                                                                                                              |
| **MDX Docs**          | 12 MDX files             | Introduction, DesignTokens, DarkMode, 9 category overviews                                                                                                                                                            |
| **Interaction Tests** | 22 components            | Play functions for Button, Checkbox, Switch, Input, Textarea, Toggle, RadioGroup, Select, Slider, Dialog, AlertDialog, DropdownMenu, Tooltip, Accordion, Tabs, Combobox, Calendar, Form, Sidebar, Carousel, PushPanel |
| **CI + Chromatic**    | 3 files modified/created | `chromatic.yml` workflow, `ci.yml` updated, `chromatic.config.json`                                                                                                                                                   |

---

## Story File Organization

```
apps/storybook/stories/
├── Introduction.mdx
├── DesignTokens.mdx
├── DarkMode.mdx
├── primitives/          (21 stories + Overview.mdx)
│   ├── Button, Badge, Input, InputGroup, Textarea, Select,
│   ├── Checkbox, RadioGroup, Switch, Slider, Label, Avatar,
│   ├── Kbd, Spinner, Progress, Skeleton, Separator,
│   └── Toggle, ToggleGroup, ButtonGroup
├── layout/              (12 stories + Overview.mdx)
│   ├── Card, Table, Tabs, Accordion, Collapsible,
│   ├── ScrollArea, AspectRatio, Resizable, Sidebar,
│   └── DataTable, PushPanel, FilterStrip
├── overlay/             (10 stories + Overview.mdx)
│   ├── Dialog, AlertDialog, Sheet, Drawer, Popover,
│   └── Tooltip, HoverCard, DropdownMenu, ContextMenu, Menubar
├── navigation/          (6 stories + Overview.mdx)
│   ├── NavigationMenu, Breadcrumb, Pagination, Command,
│   └── TopNavigation, AppTopBar
├── form/                (6 stories + Overview.mdx)
│   ├── InputOTP, Form, Field, Combobox, Calendar,
│   └── DatePicker
├── feedback/            (6 stories + Overview.mdx)
│   ├── Alert, Toast, Sonner, Empty, ErrorPage
│   └── [stubs] ChatWidget
├── display/             (data-display stories + Overview.mdx)
	│   ├── Typography, Item, Carousel, ImageZoom,
	│   └── Gantt, TimeScrubber, TimelineRangeSelector
├── charts/              (11 chart widgets + Overview.mdx)
│   └── TrendChart, BarChart, LineChart, AreaChart, PieChart,
│       ScatterChart, RadarChart, GaugeChart, HeatmapChart,
│       FunnelChart, TreemapChart
└── map/                 (6 stories + Overview.mdx)
    └── Default, Directions, Heatmap, Drawing, ThreeDView, MapControls
```

---

## Components Requiring Manual Stories (1)

These components have placeholder stubs and need manual implementation due to external dependencies:

| #   | Component  | Category | Reason                                          |
| --- | ---------- | -------- | ----------------------------------------------- |
| 1   | ChatWidget | Feedback | Not exported from package, requires backend API |

---

## Writing a New Story

### Story Template (CVA variant component)

```tsx
import type {Meta, StoryObj} from "storybook/internal/types";

import {MyComponent} from "@wakecap/core-ui/my-component";

const meta = {
	title: "Category/MyComponent",
	component: MyComponent,
	tags: ["autodocs"],
	argTypes: {
		variant: {
			control: "select",
			options: ["default", "secondary"],
		},
	},
	args: {
		children: "Example",
		variant: "default",
	},
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Secondary: Story = {
	args: {variant: "secondary"},
};
```

### Story Template (compound component)

```tsx
import type {Meta, StoryObj} from "storybook/internal/types";

import {Parent, ChildA, ChildB} from "@wakecap/core-ui/my-component";

const meta = {
	title: "Category/MyComponent",
	tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<Parent>
			<ChildA>Content A</ChildA>
			<ChildB>Content B</ChildB>
		</Parent>
	),
};
```

### Adding Interaction Tests

```tsx
import {expect, userEvent, within} from "storybook/test";

export const ClickInteraction: Story = {
	play: async ({canvasElement}) => {
		const canvas = within(canvasElement);
		const button = canvas.getByRole("button");
		await userEvent.click(button);
		await expect(button).toHaveAttribute("aria-pressed", "true");
	},
};
```

For portal-based components (Dialog, Popover, etc.), use `screen` instead of `within(canvasElement)`:

```tsx
import {screen} from "storybook/test";

// Inside play function:
const dialog = await screen.findByRole("dialog");
```

---

## CI/CD

### Existing CI (`ci.yml`)

Storybook build has been added as a step in the existing CI pipeline. It runs after the web app build and will block PRs if the Storybook build fails.

### Chromatic (`chromatic.yml`)

A dedicated Chromatic workflow runs on every PR to `main`/`develop`:

- Visual regression testing with TurboSnap (only changed stories)
- `exitZeroOnChanges: false` — unapproved visual changes block PRs
- `autoAcceptChanges: main` — auto-baselines on main branch merges

### Setup Required

1. Create a Chromatic project at [chromatic.com](https://www.chromatic.com) linked to the GitHub repo
2. Add `CHROMATIC_PROJECT_TOKEN` as a GitHub Actions secret
3. Configure viewports in Chromatic: 320px, 768px, 1280px

---

## Storybook Configuration

### Key Files

| File                                         | Purpose                                                         |
| -------------------------------------------- | --------------------------------------------------------------- |
| `apps/storybook/.storybook/main.ts`          | Framework, addons, story globs, Vite config with Tailwind CSS 4 |
| `apps/storybook/.storybook/preview.ts`       | Global parameters, dark mode config                             |
| `apps/storybook/.storybook/preview.css`      | Imports design tokens and Tailwind CSS                          |
| `apps/storybook/.storybook/wakecap-theme.ts` | Custom WakeCap light/dark themes                                |
| `apps/storybook/.storybook/manager.ts`       | Storybook UI chrome theme                                       |
| `apps/storybook/chromatic.config.json`       | TurboSnap externals for token/component changes                 |

### Tailwind CSS 4 Integration

The `preview.css` imports tokens directly from source:

```css
@import "../../../packages/tokens/src/fonts.css";
@import "../../../packages/tokens/src/index.css";
```

The Tailwind CSS 4 Vite plugin is added via `viteFinal` in `main.ts`, processing the `@theme inline` directive from `@wakecap/core-tokens`.

### Dark Mode

Dark mode uses the `.dark` class on `<html>`, matching the existing token system in `@wakecap/core-tokens`. The `storybook-dark-mode` addon toggles both:

- The Storybook UI chrome theme (navy WakeCap branding)
- The `.dark` class on the preview iframe's `<html>` element

---

## Import Paths (Storybook 10)

Storybook 10 consolidated many packages into the core `storybook` package:

| Old Import                               | New Import                     |
| ---------------------------------------- | ------------------------------ |
| `@storybook/react-vite` (Meta, StoryObj) | `storybook/internal/types`     |
| `@storybook/test`                        | `storybook/test`               |
| `@storybook/theming`                     | `storybook/theming`            |
| `@storybook/manager-api`                 | `storybook/manager-api`        |
| `@storybook/blocks`                      | `@storybook/addon-docs/blocks` |

Built-in addons (no separate install needed): viewport, controls, interactions, actions, backgrounds, measure, outline, toolbars.
