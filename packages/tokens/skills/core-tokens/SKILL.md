---
name: core-tokens
description: >
  @core/core-tokens CSS-only package. OKLCH custom properties: --background,
  --foreground, --primary, --secondary, --muted, --accent, --destructive, --success, --warning,
  --border, --input, --ring, --chart-1..5, sidebar variants. Radius:
  --radius-sm/md/lg/xl. Fonts: --font-sans/serif/mono. Shadows and spacing.
  Tailwind 4 @theme inline bridge with wwc: prefix (wwc:bg-primary,
  wwc:text-foreground, etc.). Dark mode via .dark class. Import paths,
  pre-built CSS option, and font CDN opt-in.
metadata:
  type: core
  library: core
  library_version: "0.0.1"
sources:
  - "core/Core:packages/tokens/src/index.css"
  - "core/Core:packages/tokens/src/fonts.css"
  - "core/Core:packages/tokens/package.json"
---

# @core/core-tokens — Design Tokens

## Setup

```tsx
// App entry point — must run before any component renders
import "@core/core-tokens";

// Typefaces (Figtree, Lora, IBM Plex Mono). Self-hosted WOFF2 bundled in the package —
// no CDN, no runtime request, so this is safe air-gapped and under `font-src 'self'`.
// Skip it only if you deliberately want the system fallback stack.
import "@core/core-tokens/fonts";
```

`@core/core-tokens` provides:
- CSS custom properties on `:root` and `.dark`
- Tailwind 4 `@theme inline` bridge with `wwc:` prefix (maps `wwc:bg-primary` → `var(--primary)` etc.)
- `body` base styles (`background-color`, `color`, `font-family`, `antialiasing`)
- Minimal custom scrollbar styles

**Consumer-facing exports** (for external projects, not monorepo apps):

- `@core/core-tokens/theme` — TW4 consumers: `@theme` + `:root` + `.dark` (no Tailwind import, no prefix)
- `@core/core-tokens/tailwind3-preset` — TW3 consumers: `.cjs` preset mapping tokens to TW3 theme
- `@core/core-ui/styles.css` — Pre-built CSS for no-TW / TW3 (~80 KB, flattened, includes reset)
- `@core/core-ui/styles.tw4.css` — Pre-built CSS for TW4 (~80 KB, keeps `@layer`, no reset)

## Core Patterns

### Color tokens — light and dark values

All colours use OKLCH. Reference them as CSS custom properties or via the
Tailwind utility classes bridged through `@theme inline`. All Tailwind
utilities use the `wwc:` prefix (from `@import "tailwindcss" prefix(wwc)`):

```tsx
// Via Tailwind utilities — all use wwc: prefix
<div className="wwc:bg-background wwc:text-foreground" />
<div className="wwc:bg-primary wwc:text-primary-foreground" />
<div className="wwc:bg-destructive wwc:text-destructive-foreground" />
<div className="wwc:bg-muted wwc:text-muted-foreground" />
<div className="wwc:border wwc:border-border" />

// Via CSS custom properties directly (no prefix needed)
<div style={{ backgroundColor: "var(--card)", color: "var(--card-foreground)" }} />
```

Full colour token reference:

| Token | Light | Dark | Use |
|---|---|---|---|
| `--background` | `oklch(0.985 0 0)` | `oklch(0.185 0.006 70)` | Page background |
| `--foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | Body text |
| `--card` | `oklch(1 0 0)` | `oklch(0.215 0.006 70)` | Card surface |
| `--primary` | `oklch(0.205 0 0)` | `oklch(0.922 0 0)` | Primary actions |
| `--secondary` | `oklch(0.97 0 0)` | `oklch(0.245 0.007 70)` | Secondary surface |
| `--muted` | `oklch(0.96 0 0)` | `oklch(0.26 0.007 70)` | Muted surface / table header band |
| `--muted-foreground` | `oklch(0.556 0 0)` | `oklch(0.708 0 0)` | Placeholder / secondary text |
| `--accent` | `oklch(0.975 0 0)` | `oklch(0.26 0.007 70)` | Selected / on-state fill (Calendar day, Toggle) |
| `--menu-highlight` | `oklch(0.94 0 0)` | `oklch(0.28 0.007 70)` | Focused menu / list row |
| `--destructive` | `oklch(0.577 0.245 27.3)` | `oklch(0.704 0.191 22.2)` | Error / danger |
| `--border` | `oklch(0.92 0 0)` | `oklch(0.3 0.008 70)` | Borders |
| `--input` | `oklch(0.95 0 0)` | `oklch(0.245 0.007 70)` | Input backgrounds |
| `--ring` | `oklch(0.708 0 0)` | `oklch(0.556 0 0)` | Focus rings |
| `--chart-1` | `oklch(0.92 0.07 75)` | same | Lightest amber |
| `--chart-2` | `oklch(0.85 0.12 70)` | same | Light amber |
| `--chart-3` | `oklch(0.78 0.17 65)` | same | Medium amber/orange |
| `--chart-4` | `oklch(0.71 0.22 60)` | same | Dark amber |
| `--chart-5` | `oklch(0.64 0.27 55)` | same | Darkest burnt orange |

### Radius tokens

```css
/* CSS custom properties — the scale is deliberately collapsed to one flat corner */
--radius: 5px
--radius-xs | --radius-sm | --radius-md | --radius-lg | --radius-xl | --radius-2xl: all var(--radius)
--radius-control: 4px  /* checkboxes and other small controls, so they stay square */
```

```tsx
// Tailwind utilities — wwc: prefix required
<div className="wwc:rounded-sm" />   /* wwc:rounded-sm → --radius-sm */
<div className="wwc:rounded-md" />
<div className="wwc:rounded-lg" />
<div className="wwc:rounded-xl" />
```

### Font tokens

```css
--font-sans:  Figtree, ui-sans-serif, sans-serif, system-ui
--font-serif: Lora, ui-serif, serif
--font-mono:  "IBM Plex Mono", ui-monospace, monospace
```

```tsx
<p className="wwc:font-sans">Body text in Figtree</p>
<p className="wwc:font-serif">Lora for editorial content</p>
<code className="wwc:font-mono">IBM Plex Mono for code</code>
```

System fallbacks are included — components render with acceptable fonts even
without `@core/core-tokens/fonts`.

### Dark mode toggle

Tokens define dark values under the `.dark` CSS selector. There is no
`prefers-color-scheme` media query variant:

```tsx
// Toggle dark mode — add/remove .dark on the html element
function setDarkMode(isDark: boolean) {
  document.documentElement.classList.toggle("dark", isDark);
}

// React pattern
const [isDark, setIsDark] = useState(false);
useEffect(() => {
  document.documentElement.classList.toggle("dark", isDark);
}, [isDark]);
```

### Sidebar tokens

Sidebar tokens are separate from the main colour scale and change in dark mode:

```tsx
<div className="wwc:bg-sidebar wwc:text-sidebar-foreground wwc:border-sidebar-border">
  <nav className="wwc:bg-sidebar-accent wwc:text-sidebar-accent-foreground">...</nav>
</div>
```

| Token | Light | Dark |
|---|---|---|
| `--sidebar` | `oklch(0.99 0 0)` | `oklch(0.165 0.006 70)` |
| `--sidebar-primary` | `oklch(0.205 0 0)` | `oklch(0.488 0.243 264.4)` (violet) |

## Common Mistakes

### HIGH Dark mode applied via media query instead of .dark class

Wrong:

```css
@media (prefers-color-scheme: dark) {
  body { background-color: var(--background); }
}
```

Correct:

```tsx
document.documentElement.classList.toggle("dark", isDark);
```

Tokens only define dark values under `.dark { ... }` — there is no
`@media (prefers-color-scheme: dark)` block in `index.css`. The media
query approach has no effect on token values.

Source: `packages/tokens/src/index.css:89`

---

### HIGH Tokens CSS imported after component CSS loses theme bridge

Wrong:

```tsx
import "./my-component-styles.css";  // uses bg-primary, text-foreground
import "@core/core-tokens";       // imported after — @theme not yet defined
```

Correct:

```tsx
import "@core/core-tokens";       // first — defines @theme inline and :root vars
import "./my-component-styles.css";
```

The Tailwind 4 `@theme inline` block must be processed before any CSS that
uses the token-based utilities. Import order in the entry point determines
this — tokens must come first.

Source: `packages/tokens/src/index.css:1`

---

### MEDIUM Tailwind token utilities used in a project that didn't import the package

Wrong:

```tsx
// Consumer project that never installed @core/core-tokens
<div className="wwc:bg-sidebar wwc:text-sidebar-foreground" />
// These classes emit no styles — Tailwind 4 doesn't know about sidebar tokens
```

Correct (option A — pre-built CSS, simplest):

```css
/* your-app/src/index.css */
@import "@core/core-ui/styles.css";
```

Correct (option B — Tailwind 4, full control):

```bash
pnpm add @core/core-tokens
```

```tsx
// In app entry point
import "@core/core-tokens";
```

Tailwind 4 does not include `--sidebar`, `--chart-1..5`, or other Core
tokens by default. The `@theme inline` block in `index.css` registers them.
Without importing the package (or using the pre-built CSS), these utilities
compile to empty rules.

Source: `packages/tokens/src/index.css:3`
