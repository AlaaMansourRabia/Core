# skills/_artifacts/skill_spec.md
# Wakecore Skill Specification

## Library

**Name:** Wakecore  
**Packages:** `@wakecap/core-ui`, `@wakecap/core-tokens`, `@wakecap/core-utils`  
**Version:** 0.0.1  
**Framework:** React 19 only  
**Consumers:** Internal WakeCap product teams building features with the design system

---

## Goals

An agent loading these skills should be able to:

1. Install and configure all three Wakecore packages correctly from the first try
2. Import any component using the correct deep-path import without guessing
3. Compose forms with react-hook-form + zod + Form* components correctly
4. Build DataTable instances with column definitions, sorting, filtering, expansion
5. Render charts using ChartContainer (shadcn-style) or ChartRenderer (AI-generated)
6. Embed the ChatWidget and wire up a real API endpoint
7. Apply and override design tokens (light/dark, colors, radius, fonts)
8. Use cn() and cva/VariantProps for className composition and custom variants
9. Choose the right component among ambiguous groups (overlays, actions, inputs, data, navigation, feedback) using the when/why catalog in library-index.json
10. Assemble standard screens (app shell, dashboard, form-in-dialog, template gallery, data view with filters) with correct provider wiring and ordering

---

## Skill structure

Wakecore has two independently published chart systems, a standalone token package,
and a minimal utils package. The skill set maps directly to developer tasks — not
to technical domains. Use **flat structure** (one SKILL.md per task).

Skills are co-located with the package they document:

```
packages/components/skills/   →  @wakecap/core-ui skills
packages/tokens/skills/       →  @wakecap/core-tokens skills
packages/utils/skills/        →  @wakecap/core-utils skills
```

---

## Skill inventory

| Skill slug | Package | Type | Path |
|---|---|---|---|
| `core-ui-quickstart` | `@wakecap/core-tokens` | lifecycle | `packages/tokens/skills/core-ui-quickstart/SKILL.md` |
| `core-ui-components` | `@wakecap/core-ui` | core | `packages/components/skills/core-ui-components/SKILL.md` |
| `core-ui-forms` | `@wakecap/core-ui` | core | `packages/components/skills/core-ui-forms/SKILL.md` |
| `core-ui-data-table` | `@wakecap/core-ui` | core | `packages/components/skills/core-ui-data-table/SKILL.md` |
| `core-ui-charts` | `@wakecap/core-ui` | core | `packages/components/skills/core-ui-charts/SKILL.md` |
| `core-ui-chat` | `@wakecap/core-ui` | core | `packages/components/skills/core-ui-chat/SKILL.md` |
| `core-tokens` | `@wakecap/core-tokens` | core | `packages/tokens/skills/core-tokens/SKILL.md` |
| `core-utils` | `@wakecap/core-utils` | core | `packages/utils/skills/core-utils/SKILL.md` |

---

## Writing rules

- Every code block uses real package imports (exact deep-path, exact name)
- No placeholder code (`// ...`, `[your value]`) — all examples are complete
- All Tailwind utility class examples use the `wwc:` prefix (e.g., `wwc:bg-primary`, `wwc:flex`, `wwc:p-4`). The `cn()` utility is configured with `prefix: "wwc"` in tailwind-merge — unprefixed classes bypass conflict resolution.
- All failure modes are plausible (agent would generate them), silent (no crash), and grounded
- Components section covers only what is non-obvious — no generic React or TypeScript concepts
- Cross-package references use "See also" links
- Dark mode section always notes `.dark` class mechanism (not media query)
- Browser-only utils (cssColorToRgb, getChartColors) always carry a useEffect/event-handler constraint

---

## Context for agents

Wakecore is a private design system published to GitHub Packages. Consumers need
`.npmrc` with `@wakecap:registry=https://npm.pkg.github.com` before installation.

All Tailwind utility classes in Wakecore use the `wwc:` prefix (from
`@import "tailwindcss" prefix(wwc)` in core-tokens). Consumer code that uses
`cn()` from `@wakecap/core-utils` or passes `className` props to Wakecore
components must prefix utilities with `wwc:` (e.g., `wwc:bg-primary`,
`wwc:flex`). The `cn()` utility uses `extendTailwindMerge({ prefix: "wwc" })`
— unprefixed classes are accepted but tailwind-merge cannot detect or resolve
conflicts between them.

Three setup paths exist for consumers:
- **Pre-built CSS** (`@import "@wakecap/core-ui/styles.css"`) — no Tailwind required
- **Tailwind 4** — import `@wakecap/core-tokens` + `@source` the component dist
- **Tailwind 3** — use pre-built CSS alongside existing TW3 (no conflicts due to `wwc:` prefix)

The `@wakecap/core-ui` barrel (`import from "@wakecap/core-ui"`) only exports
types, mock-data, and chatService. All components use deep-path imports:
`import { X } from "@wakecap/core-ui/x"`.

`@wakecap/core-tokens` is CSS-only with no JavaScript — import it once at the
app entry point. It provides OKLCH tokens, a Tailwind 4 `@theme inline` bridge,
and `body` base styles. Dark mode is toggled by the `.dark` class on `<html>`.
