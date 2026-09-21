---
name: core-ui-quickstart
description: >
  First-time installation and setup for Core (@core/core-ui,
  @core/core-tokens, @core/core-utils). GitHub Packages .npmrc
  authentication, three CSS setup paths (pre-built, Tailwind 4, Tailwind 3),
  the wwc: Tailwind class prefix, correct import order, self-hosted fonts,
  and rendering a first component. Load this skill before any other Core
  skill.
metadata:
  type: lifecycle
  library: core
  library_version: "0.0.1"
sources:
  - "core/Core:README.md"
  - "core/Core:packages/tokens/src/index.css"
  - "core/Core:packages/tokens/src/fonts.css"
  - "core/Core:packages/components/package.json"
---

# Core — Quickstart

## Setup

### 1. Configure GitHub Packages registry

Core is published to GitHub Packages, not the public npm registry.
Add to the project's `.npmrc` (or `~/.npmrc` for global):

```ini
@core:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

Token requires `read:packages` scope.

Automated setup (requires `gh` CLI, authenticated):

```bash
gh api /repos/core/frontend-helpers/contents/scripts/setup-gh-registry.sh \
  --jq '.content' | base64 -d | bash
```

### 2. Install packages

```bash
pnpm add @core/core-ui @core/core-tokens @core/core-utils
```

Pre-release (latest from `develop` branch):

```bash
pnpm add @core/core-ui@next @core/core-tokens@next @core/core-utils@next
```

### 3. CSS class prefix (internal)

All Tailwind utility classes **inside** Core components use the **`wwc:`**
prefix to prevent collisions with your app's own styles. This is an internal
implementation detail — **you never use `wwc:` in your own code**. Components
are self-styled; you just import and use them.

### 4. Add fonts

Import them — the WOFF2 files ship inside the package:

```tsx
import "@core/core-tokens/fonts";
```

That declares `@font-face` for Figtree (`--font-sans`), IBM Plex Mono (`--font-mono`) and Lora
(`--font-serif`), all served from your own origin. No CDN link, no runtime request to a third party,
and `font-src 'self'` is enough for CSP.

If you use the pre-built `@core/core-ui/styles.css`, the faces are already inlined and the WOFF2
files sit beside it in `dist/fonts/` — nothing extra to import, but do keep them when you copy the
CSS somewhere else.

Skip the import only if you deliberately want the system fallback stack.

### 5. Choose a CSS setup path

#### Path A — Pre-built CSS (No Tailwind required)

The simplest option. Works with **any framework** — no Tailwind CSS needed in
your project. Also works alongside Tailwind 3 or 4 without conflicts.

```tsx
// your-app/src/main.tsx
import "@core/core-ui/styles.css";
```

This single import includes all design tokens, dark mode support, and every
utility class used by the components. **~80 KB total.**

#### Path B — Tailwind CSS 4

For projects already on **Tailwind CSS 4**. Uses a dedicated pre-built CSS for
component styles (no reset conflicts) plus a theme import for design tokens.

**1.** Configure your CSS with Tailwind and the Core theme:

```css
/* your-app/src/index.css */
@import "tailwindcss";
@import "@core/core-tokens/theme";
```

**2.** Import component styles in your app entry. Your CSS first,
component styles **after**:

```tsx
// your-app/src/main.tsx
import "./index.css";                      // your TW4 CSS first
import "@core/core-ui/styles.tw4.css";  // component styles after
```

`styles.tw4.css` provides `wwc:` prefixed component styles without a duplicate
reset. The import order ensures correct `@layer` cascade priority.

#### Path C — Tailwind CSS 3

For projects on **Tailwind CSS 3**. Uses the pre-built CSS for component styles,
plus a Tailwind preset so you can use the design tokens as standard TW3 classes.

**1.** Import Core CSS in your app entry, **before** your own CSS:

```tsx
// your-app/src/main.tsx
import "@core/core-ui/styles.css";
import "./index.css"; // your TW3 styles (@tailwind base/components/utilities)
```

**2.** Add the Core preset to your Tailwind config:

```js
// tailwind.config.cjs
const corePreset = require("@core/core-tokens/tailwind3-preset");

module.exports = {
  presets: [corePreset],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
};
```

Now design token classes like `text-muted-foreground`, `bg-primary`,
`border-border` work as standard unprefixed utilities, resolving to the same
CSS custom properties used by the components.

### 6. Render a first component

All components use deep-path imports — never import from the package root.

```tsx
import {Button} from "@core/core-ui/button";
import {Card, CardHeader, CardTitle, CardContent} from "@core/core-ui/card";

export function Example() {
	return (
		<Card className="wwc:w-64">
			<CardHeader>
				<CardTitle>Hello Core</CardTitle>
			</CardHeader>
			<CardContent>
				<Button>Click me</Button>
			</CardContent>
		</Card>
	);
}
```

## Core Patterns

### Deep-path imports for all components

Every component has its own export path. The barrel (`@core/core-ui`) only
exports types, mock-data, and chatService — not components.

```tsx
import {Button} from "@core/core-ui/button";
import {Input} from "@core/core-ui/input";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@core/core-ui/dialog";
import {DataTable} from "@core/core-ui/data-table";
import {ChartContainer} from "@core/core-ui/chart";
import {Combobox} from "@core/core-ui/combobox";
import {Map} from "@core/core-ui/map";
import {Gantt} from "@core/core-ui/gantt";
import {Banner} from "@core/core-ui/banner";
import {Empty} from "@core/core-ui/empty";
import {ErrorPage} from "@core/core-ui/error-page";
import {Field} from "@core/core-ui/field";
import {InputGroup} from "@core/core-ui/input-group";
import {Kbd} from "@core/core-ui/kbd";
```

### Type imports from the barrel

Types and domain types are exported from the barrel:

```tsx
import type {Organization, Project, OrgTab, ProjectTab} from "@core/core-ui/types";
import type {Message, ChartData, DashboardWidget} from "@core/core-ui/types/chat";
```

### Dark mode toggle

Tokens define dark mode values under the `.dark` CSS selector class — there is
no `prefers-color-scheme` media query. Toggle dark mode by adding/removing the
class on the `<html>` element:

```tsx
document.documentElement.classList.toggle("dark", isDark);
```

## Common Mistakes

### HIGH Importing components from the package barrel

Wrong:

```tsx
import {Button, Card, Input} from "@core/core-ui";
```

Correct:

```tsx
import {Button} from "@core/core-ui/button";
import {Card, CardHeader, CardContent} from "@core/core-ui/card";
import {Input} from "@core/core-ui/input";
```

The barrel index only re-exports types, mock-data, and chatService. Component
named exports are undefined when imported from the root — no error is thrown.

Source: `packages/components/src/index.ts`

---

### HIGH Using unprefixed Tailwind utilities with Core components

Wrong:

```tsx
// Unprefixed — these classes are silently ignored by cn()
<Button className={cn("w-full", isActive && "ring-2 ring-primary")}>Submit</Button>
```

Correct:

```tsx
// wwc: prefix — tailwind-merge resolves conflicts correctly
<Button className={cn("wwc:w-full", isActive && "wwc:ring-2 wwc:ring-primary")}>Submit</Button>
```

All Core components use `wwc:`-prefixed Tailwind classes internally. The
`cn()` utility is configured with `extendTailwindMerge({ prefix: "wwc" })`.
Passing unprefixed classes means tailwind-merge cannot detect conflicts between
your overrides and the component's default classes — both values stay in the
output and CSS specificity determines the winner unpredictably.

Source: `packages/utils/src/index.ts:4`

---

### HIGH Omitting the tokens CSS import causes unstyled components

Wrong:

```tsx
// main.tsx — no tokens or styles import
import App from "./App";
createRoot(document.getElementById("root")!).render(<App />);
```

Correct (pre-built CSS):

```css
/* index.css */
@import "@core/core-ui/styles.css";
```

Correct (Tailwind 4):

```tsx
import "@core/core-tokens"; // must come first
import App from "./App";
createRoot(document.getElementById("root")!).render(<App />);
```

Without `@core/core-tokens` or `@core/core-ui/styles.css`, the
`@theme inline` bridge and CSS custom properties are not defined. Tailwind
utilities like `wwc:bg-primary`, `wwc:text-foreground` emit no styles and
components render with broken or transparent colours.

Source: `packages/tokens/src/index.css:1`

---

### MEDIUM Copying the pre-built CSS without its fonts

Wrong:

```bash
cp node_modules/@core/core-ui/dist/styles.css public/core.css   # fonts left behind
```

The `@font-face` rules inside `styles.css` point at `fonts/*.woff2` relative to the file. Move the CSS
without that directory and every family silently falls back to a system stack — the tokens still look
compliant, so this fails quietly.

Correct:

```bash
cp -R node_modules/@core/core-ui/dist/styles.css node_modules/@core/core-ui/dist/fonts public/
```

The fonts are self-hosted, so this works air-gapped and under `font-src 'self'`. There is no CDN
fallback to rely on.

---

See also: `core-tokens/SKILL.md` — full token reference (colors, radius, dark mode)
See also: `core-ui-components/SKILL.md` — component import patterns and variant API
