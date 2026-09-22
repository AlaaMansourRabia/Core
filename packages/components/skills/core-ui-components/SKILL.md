---
name: core-ui-components
description: >
  Importing and composing @core/core-ui component primitives. Deep-path
  imports, wwc: Tailwind class prefix, Button (variants: default/destructive/
  outline/secondary/ghost/link, sizes: default/sm/lg/icon, loading state,
  asChild), SidebarProvider layout wiring, TooltipProvider requirement, cn()
  className merging with wwc: prefix, cva/VariantProps for authoring custom
  variants. Load when building UI with Core primitives.
metadata:
  type: core
  library: core
  library_version: "0.0.1"
sources:
  - "core/Core:packages/components/src/button.tsx"
  - "core/Core:packages/components/src/sidebar.tsx"
  - "core/Core:packages/components/src/index.ts"
  - "core/Core:packages/components/package.json"
  - "core/Core:packages/utils/src/index.ts"
---

# @core/core-ui — Component Primitives

## Setup

Each component has its own export path. Import only what is needed:

```tsx
import {Button} from "@core/core-ui/button";
import {Input} from "@core/core-ui/input";
import {Card, CardHeader, CardTitle, CardContent, CardFooter} from "@core/core-ui/card";
import {Badge} from "@core/core-ui/badge";
import {Separator} from "@core/core-ui/separator";
import {cn} from "@core/core-utils";
```

## Core Patterns

### Button — variants, sizes, loading, asChild

```tsx
import { Button } from "@core/core-ui/button";

// Variants: default | destructive | outline | secondary | ghost | link
// Sizes:    default | sm | lg | icon
<Button variant="outline" size="sm">Cancel</Button>
<Button variant="destructive">Delete</Button>
<Button size="icon"><TrashIcon /></Button>

// Loading state — disables button and shows spinner
<Button loading={isSubmitting}>Save</Button>

// asChild — delegates button behaviour to a child element (e.g. Link)
import { Link } from "react-router-dom";
<Button asChild>
  <Link to="/dashboard">Go to Dashboard</Link>
</Button>
```

### cn() — className merging with `wwc:` prefix

All Tailwind utilities passed to `cn()` must use the `wwc:` prefix:

```tsx
import {cn} from "@core/core-utils";

// Merges clsx conditions and resolves conflicting wwc:-prefixed utilities
<Button className={cn("wwc:w-full", isActive && "wwc:ring-2 wwc:ring-primary")}>Submit</Button>;

// Conflict resolution: last wwc:bg-* wins
cn("wwc:bg-primary wwc:text-primary-foreground", "wwc:bg-destructive");
// → "wwc:text-primary-foreground wwc:bg-destructive"
```

### cva — authoring components with variants

```tsx
import {cva, type VariantProps} from "@core/core-utils";
import {cn} from "@core/core-utils";

const statusBadge = cva(
	"wwc:inline-flex wwc:items-center wwc:rounded-full wwc:px-2.5 wwc:py-0.5 wwc:text-xs wwc:font-medium",
	{
		variants: {
			status: {
				"on-track": "wwc:bg-green-100 wwc:text-green-800",
				"at-risk": "wwc:bg-yellow-100 wwc:text-yellow-800",
				critical: "wwc:bg-red-100 wwc:text-red-800",
			},
		},
		defaultVariants: {status: "on-track"},
	},
);

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof statusBadge> {}

function StatusBadge({status, className, ...props}: StatusBadgeProps) {
	return <span className={cn(statusBadge({status}), className)} {...props} />;
}
```

### TooltipProvider — required context for all Tooltip usage

```tsx
import {TooltipProvider, Tooltip, TooltipTrigger, TooltipContent} from "@core/core-ui/tooltip";

// Wrap the layout or app root — one provider covers all descendant tooltips
function AppLayout({children}: {children: React.ReactNode}) {
	return <TooltipProvider>{children}</TooltipProvider>;
}

// Usage anywhere under the provider
<Tooltip>
	<TooltipTrigger asChild>
		<Button size="icon" variant="ghost">
			<BellIcon />
		</Button>
	</TooltipTrigger>
	<TooltipContent>Notifications</TooltipContent>
</Tooltip>;
```

### SidebarProvider — full-page layout with collapsible sidebar

```tsx
import {SidebarProvider} from "@core/core-ui/sidebar";
import {
	Sidebar,
	SidebarHeader,
	SidebarContent,
	SidebarFooter,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
} from "@core/core-ui/sidebar";

// Must wrap the entire page layout at root level
function RootLayout({children}: {children: React.ReactNode}) {
	return (
		<SidebarProvider defaultOpen={true}>
			<Sidebar>
				<SidebarHeader>Logo</SidebarHeader>
				<SidebarContent>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton>Dashboard</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarContent>
				<SidebarFooter>Footer</SidebarFooter>
			</Sidebar>
			<main className="wwc:flex-1">{children}</main>
		</SidebarProvider>
	);
}
```

## Common Mistakes

### HIGH Importing components from the package barrel

Wrong:

```tsx
import {Button, Input, Card} from "@core/core-ui";
```

Correct:

```tsx
import {Button} from "@core/core-ui/button";
import {Input} from "@core/core-ui/input";
import {Card, CardHeader, CardContent} from "@core/core-ui/card";
```

`@core/core-ui` barrel only re-exports types, mock-data, and chatService.
Component named exports are `undefined` at runtime — no error is thrown.

Source: `packages/components/src/index.ts`

---

### HIGH Using Tooltip without TooltipProvider ancestor

Wrong:

```tsx
// Somewhere in a component without a TooltipProvider above it
<Tooltip>
	<TooltipTrigger>hover</TooltipTrigger>
	<TooltipContent>info</TooltipContent>
</Tooltip>
```

Correct:

```tsx
// In the layout/app root
<TooltipProvider>
	<App /> {/* all Tooltip usages inside App are covered */}
</TooltipProvider>
```

Tooltip throws at runtime when attempting to open if `TooltipProvider` is not
an ancestor. The error only manifests on hover, not during render.

Source: `packages/components/src/navigation/core-dashboard-header.tsx:75`

---

### MEDIUM SidebarProvider nested inside a component instead of at root

Wrong:

```tsx
// Inside a page component
function DashboardPage() {
	return (
		<SidebarProvider>
			<Sidebar>...</Sidebar>
			<div>{content}</div>
		</SidebarProvider>
	);
}
```

Correct:

```tsx
// At the root layout level, wrapping the full viewport
function RootLayout({children}: {children: React.ReactNode}) {
	return (
		<SidebarProvider>
			<Sidebar>...</Sidebar>
			<main className="wwc:flex-1">{children}</main>
		</SidebarProvider>
	);
}
```

`SidebarProvider` sets `min-h-svh w-full` on its wrapper div and injects
`--sidebar-width` CSS custom properties. Nesting it inside a constrained
component causes layout conflicts and scoping issues.

Source: `packages/components/src/sidebar.tsx:68`

---

### HIGH Passing unprefixed className to Core components

Wrong:

```tsx
// Unprefixed — cn() inside the component can't resolve conflicts
<Button className="bg-red-500 w-full">Delete</Button>
```

Correct:

```tsx
// wwc: prefix — tailwind-merge resolves correctly
<Button className="wwc:bg-red-500 wwc:w-full">Delete</Button>
```

All Core components use `wwc:`-prefixed classes internally and merge via
`cn()` which is configured with `prefix: "wwc"`. Unprefixed overrides are
treated as unknown custom classes — conflicts with the component's defaults
are not resolved and CSS specificity determines the winner unpredictably.

Source: `packages/utils/src/index.ts:4`

---

### MEDIUM Passing className without cn() loses Tailwind precedence

Wrong:

```tsx
// wwc:bg-red-500 may be silently overridden by wwc:bg-primary from the variant
<Button className="wwc:bg-red-500">Delete</Button>
```

Correct:

```tsx
import {cn} from "@core/core-utils";
// cn() via tailwind-merge resolves wwc:bg-* conflict in favour of the last value
<Button className={cn("wwc:bg-red-500")}>Delete</Button>;
```

Without `cn()`, conflicting Tailwind utilities (e.g. two `wwc:bg-*` classes) resolve
by CSS specificity and source order, not by which class appears last in JSX.

Source: `packages/utils/src/index.ts:4`

---

See also: `core-utils/SKILL.md` — cn(), cva, VariantProps full reference
See also: `core-tokens/SKILL.md` — token CSS vars used in Tailwind utilities
