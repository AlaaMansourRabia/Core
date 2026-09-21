---
name: core-utils
description: >
  @wakecap/core-utils exports: cn() (clsx + tailwind-merge with wwc: prefix,
  resolves conflicting wwc:-prefixed Tailwind utilities for safe className
  composition), cva and VariantProps (re-exported from class-variance-authority
  for authoring components with variants), cssColorToRgb/getChartColors/
  getCssVarAsRgb (SSR-safe OKLCH-to-RGB converters for ECharts or canvas).
metadata:
  type: core
  library: wakecore
  library_version: "0.0.1"
sources:
  - "wakecap/Wakecore:packages/utils/src/index.ts"
  - "wakecap/Wakecore:packages/utils/package.json"
---

# @wakecap/core-utils — Utilities

## Setup

```tsx
import {cn, cva, type VariantProps} from "@wakecap/core-utils";

import {cssColorToRgb, getChartColors, getCssVarAsRgb} from "@wakecap/core-utils";
```

## Core Patterns

### cn() — safe className composition with `wwc:` prefix

`cn()` merges class strings using `clsx` (conditionals, arrays, objects) and
resolves conflicting Tailwind utilities via `tailwind-merge`. It is configured
with `extendTailwindMerge({ prefix: "wwc" })` — all Tailwind utility classes
must use the `wwc:` prefix for conflict resolution to work:

```tsx
import {cn} from "@wakecap/core-utils";

// Conditional classes — all utilities use wwc: prefix
<div className={cn("wwc:p-4 wwc:rounded-lg", isActive && "wwc:ring-2 wwc:ring-primary")} />;

// Tailwind conflict resolution — last wwc:bg-* wins
cn("wwc:bg-primary wwc:text-white", "wwc:bg-destructive");
// → "wwc:text-white wwc:bg-destructive"

// Array and object syntax from clsx
cn(["wwc:base-class", {"wwc:active-class": isActive, "wwc:disabled-class": isDisabled}]);

// Override Tailwind utilities from a component's default className
function Card({className}: {className?: string}) {
	return <div className={cn("wwc:rounded-lg wwc:border wwc:bg-card wwc:p-6", className)} />;
}
// <Card className="wwc:p-2" /> → "wwc:rounded-lg wwc:border wwc:bg-card wwc:p-2"
```

### cva — component variant authoring

All utility classes in `cva()` definitions must use the `wwc:` prefix:

```tsx
import { cva, type VariantProps } from "@wakecap/core-utils";
import { cn } from "@wakecap/core-utils";

const alertVariants = cva(
  "wwc:flex wwc:items-start wwc:gap-3 wwc:rounded-lg wwc:border wwc:p-4 wwc:text-sm",
  {
    variants: {
      variant: {
        default:     "wwc:border-border wwc:bg-card wwc:text-card-foreground",
        destructive: "wwc:border-destructive/50 wwc:bg-destructive/10 wwc:text-destructive",
        warning:     "wwc:border-yellow-500/50 wwc:bg-yellow-50 wwc:text-yellow-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

function Alert({ variant, className, ...props }: AlertProps) {
  return <div className={cn(alertVariants({ variant }), className)} {...props} />;
}

// Usage
<Alert variant="destructive">Something went wrong.</Alert>
<Alert variant="warning" className="wwc:mt-4">Check your settings.</Alert>
```

### cssColorToRgb — convert any CSS color to RGB

Uses the browser's colour engine to convert OKLCH, HSL, named colours, etc. to
`rgb(r, g, b)` format. During SSR it safely returns the original CSS color:

```tsx
import {cssColorToRgb} from "@wakecap/core-utils";

// Only call inside useEffect, event handlers, or browser-only modules
useEffect(() => {
	const rgb = cssColorToRgb("oklch(0.78 0.17 65)");
	// → "rgb(217, 148, 71)"
	setColor(rgb);
}, []);
```

### getChartColors — all 5 chart token values as RGB

```tsx
import {getChartColors} from "@wakecap/core-utils";

// Returns ["rgb(...)", "rgb(...)", ...] for --chart-1 through --chart-5
// Reflects the current mode (light or dark) at call time
useEffect(() => {
	const colors = getChartColors();
	// Use with ECharts: series[i].itemStyle.color = colors[i]
	setEChartsColors(colors);
}, []);
```

### getCssVarAsRgb — single CSS variable to RGB

```tsx
import {getCssVarAsRgb} from "@wakecap/core-utils";

useEffect(() => {
	const primaryRgb = getCssVarAsRgb("--primary");
	// → "rgb(52, 52, 52)" in light mode
	// Warns and resolves currentColor if the variable is not defined
}, []);
```

## Common Mistakes

### HIGH Passing unprefixed Tailwind classes to cn()

Wrong:

```tsx
// Unprefixed — tailwind-merge cannot detect the bg-* conflict
cn("bg-primary text-white", "bg-destructive");
// → "bg-primary text-white bg-destructive"  ✗ both bg-* classes remain
```

Correct:

```tsx
// wwc: prefix — tailwind-merge resolves the conflict correctly
cn("wwc:bg-primary wwc:text-white", "wwc:bg-destructive");
// → "wwc:text-white wwc:bg-destructive"  ✓ conflict resolved
```

`cn()` uses `extendTailwindMerge({ prefix: "wwc" })`. Without the prefix,
tailwind-merge treats classes as unknown custom classes and keeps all of them.
Conflicts between `bg-primary` and `bg-destructive` are silently ignored —
both classes appear in the output and CSS specificity determines the winner.

Source: `packages/utils/src/index.ts:4`

---

### MEDIUM Expecting resolved RGB outside the browser

Wrong:

```tsx
// During SSR/Node these are safe but cannot resolve the active computed theme.
const colors = getChartColors();
const primary = getCssVarAsRgb("--primary");
```

Correct:

```tsx
useEffect(() => {
	const colors = getChartColors();
	setColors(colors);
}, []);

// Or in a click handler
function handleExport() {
	const primary = getCssVarAsRgb("--primary");
	exportChart({color: primary});
}
```

Outside a browser, `cssColorToRgb` returns its input and the token helpers return
`var(--token)` references. Resolve after mount when a consumer needs literal RGB;
`ChartContainer` handles this automatically before passing options to ECharts.

Source: `packages/utils/src/index.ts:9`

---

### MEDIUM Expecting cn() to deduplicate identical non-conflicting classes

Wrong:

```tsx
// Expecting "wwc:p-2 wwc:rounded"
cn("wwc:p-2 wwc:rounded", "wwc:p-2 wwc:rounded");
```

Correct:

```tsx
// cn() does not deduplicate non-conflicting duplicates
// Result: "wwc:p-2 wwc:rounded wwc:p-2 wwc:rounded"

// cn() only resolves conflicts between utilities of the same type
cn("wwc:p-2 wwc:rounded wwc:bg-primary", "wwc:bg-secondary");
// → "wwc:p-2 wwc:rounded wwc:bg-secondary"  ✓ conflict resolved
```

`tailwind-merge` removes conflicting Tailwind utilities (e.g. two `bg-*` values,
two `p-*` values). It does not deduplicate non-conflicting duplicate classes.
This is intentional and expected.

Source: `packages/utils/src/index.ts:4`

---

### MEDIUM Importing cva from class-variance-authority directly instead of @wakecap/core-utils

Wrong:

```tsx
import {cva, type VariantProps} from "class-variance-authority";
```

Correct:

```tsx
import {cva, type VariantProps} from "@wakecap/core-utils";
```

Both resolve to the same package but `@wakecap/core-utils` re-exports them
as the canonical import path for Wakecore consumers. Using `class-variance-authority`
directly requires adding it as a separate dependency and risks version drift.

Source: `packages/utils/src/index.ts:43`

---

See also: `core-ui-components/SKILL.md` — cn() and cva usage in component composition
See also: `core-ui-charts/SKILL.md` — getChartColors/getCssVarAsRgb for ECharts
