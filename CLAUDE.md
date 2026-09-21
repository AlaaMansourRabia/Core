# CLAUDE.md — Wakecore Project Rules

## Monorepo Overview

Wakecore is WakeCap's design system and component library. It's a pnpm monorepo with Nx build orchestration.

```
packages/
  components/   @wakecap/core-ui         tsdown library build
  tokens/       @wakecap/core-tokens     CSS + TW3 preset (copy build)
  utils/        @wakecap/core-utils      tsdown library build
apps/
  web/          Demo/docs app            Vite + React Router
playground/
  tw3/          TW3 consumer test app    Vite + React + Tailwind 3
  tw4/          TW4 consumer test app    Vite + React + Tailwind 4
```

### CSS Class Prefix

All Tailwind utilities inside core-ui components use the `wwc:` prefix to avoid collisions with consumer styles. This is an **internal implementation detail** — consumers never write `wwc:` in their own code. Components are self-styled black boxes.

**This applies to documentation too.** A JSDoc example must never tell a consumer to write a `wwc:` class: `cn()` is `extendTailwindMerge({prefix: "wwc"})`, so a prefixed class from a consumer *is* recognised and *does* replace the component's own — but whether it then paints depends on whether that utility happened to be compiled into the shipped CSS, which is a build artifact, not API. `wwc:bg-green-500` works; `wwc:bg-lime-400` renders nothing, with no error. Recommend a plain unprefixed class from the consumer's own CSS, or an inline `style` where a library utility would conflict (e.g. `<SheetContent overlayProps={{style: {top: 56}}} />` beats the scrim's `inset-0`). `pnpm validate:doc-classes` enforces this in CI.

### Pre-built CSS

The core-ui build produces two pre-built CSS files via `scripts/flatten-css.mjs` (PostCSS + cssnano):

- `styles.css` — For no-Tailwind and TW3 consumers (flattened, includes reset)
- `styles.tw4.css` — For TW4 consumers (keeps `@layer`, no reset)

### Consumer Token Exports

`@wakecap/core-tokens` provides theme configuration for each consumer type:

- `@wakecap/core-tokens/theme` — TW4 consumers (`@theme` + `:root` + `.dark`)
- `@wakecap/core-tokens/tailwind3-preset` — TW3 consumers (`.cjs` preset)
- `@wakecap/core-tokens` — monorepo internal (includes `@import "tailwindcss" prefix(wwc)`)

**Tooling:** pnpm 10, Nx, Oxlint (linting), Oxfmt (formatting), TypeScript 5.9, React 19, Tailwind CSS 4

## Agent Skills (TanStack Intent)

This repo ships agent skills with each published package. After `pnpm install`,
load the skills so your agent knows how to use Wakecore correctly:

```bash
npx @tanstack/intent@latest install
```

Skills are co-located with their packages:

```
packages/components/skills/   →  @wakecap/core-ui skills
packages/tokens/skills/       →  @wakecap/core-tokens skills
packages/utils/skills/        →  @wakecap/core-utils skills
skills/_artifacts/            →  domain_map.yaml, skill_spec.md, skill_tree.yaml
```

To list available skills:

```bash
npx @tanstack/intent@latest list
```

## Commit Conventions

This repo enforces [Conventional Commits](https://www.conventionalcommits.org/) via commitlint + Husky.

**Format:**

```
type(scope): description
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`, `build`, `perf`

**Scopes (optional):** `tokens`, `ui`, `utils`, `web`, `deps`

**Examples:**

- `feat(ui): add DateRangePicker component`
- `fix(tokens): correct dark mode border color`
- `chore(deps): update radix-ui packages`
- `ci: add conventional commit validation`
- `docs: update installation guide`

**Rules:**

- Subject must be lowercase (no leading capital)
- No period at the end of the subject
- Use imperative mood ("add feature" not "added feature")
- Scopes are optional but encouraged for package-specific changes

## Changesets Workflow

This repo uses [Changesets](https://github.com/changesets/changesets) for versioning stable releases.

**When to add a changeset:** Any PR that changes public API, fixes a bug, or adds a feature in a published package (`@wakecap/core-ui`, `@wakecap/core-tokens`, `@wakecap/core-utils`).

**How:**

```bash
pnpm changeset
```

Select the affected packages and bump type:

- `patch` — bug fixes, minor tweaks
- `minor` — new features, non-breaking additions
- `major` — breaking changes

Commit the generated `.changeset/*.md` file with your PR.

**Release flow:** Merging to `main` triggers a "Version Packages" PR. Merging that PR publishes to GitHub Packages.

## Release Channels

| Channel | Tag | Branch | Trigger |
|---------|-----|--------|---------|
| **Stable** | `latest` | `main` | Merge "Version Packages" PR (Changesets) |
| **Pre-release** | `next` | `develop` | Every push (timestamp versions) |

Pre-release format: `0.0.1-next.YYYYMMDD.HHMMSS.shortsha`

## Code Style

- **Linter:** Oxlint (not ESLint) — config in `.oxlintrc.json`
- **Formatter:** Oxfmt (not Prettier) — config in `.oxfmtrc.json`
- **Indentation:** Tabs
- **Print width:** 120 characters
- **Quotes:** Double quotes
- **Semicolons:** Always
- **Trailing commas:** All
- **Import sorting:** Automatic via Oxfmt (type imports first, then builtins/external, then internal)

Run linting and formatting:

```bash
pnpm lint          # Oxlint
pnpm format        # Oxfmt (write)
pnpm format:check  # Oxfmt (check only)
```

## Testing

- **Framework:** Vitest 4 + Browser Mode (Playwright/Chromium)
- **Test files:** Co-located as `*.test.tsx` next to component source
- **Screenshot baselines:** Stored in `packages/components/src/__screenshots__/`

```bash
pnpm test                              # Run all tests
pnpm --filter @wakecap/core-ui test        # Run UI tests only
pnpm --filter @wakecap/core-ui test:update # Update screenshot baselines
```

Key patterns:

- `render()` is async — always `await` it
- Use `page.getByRole()` / `page.getByText()` for locators
- Use `expect.element(locator)` for async DOM assertions
- Import from `vitest-browser-react`, `vitest`, and `vitest/browser`

## CI/CD

**On push / PR to `main` or `develop` (CI):**

1. Install dependencies
2. Build all `@wakecap/core-*` packages
3. Typecheck
4. Lint (Oxlint)
5. Format check (Oxfmt)
6. Run tests
7. Build web app
8. Validate commit messages (commitlint, PRs only)

**On push to `main` (Publish):**

- Changesets action creates/updates "Version Packages" PR, or publishes if versions were bumped

**On push to `develop` (Publish Next):**

- Publishes pre-release versions with `next` tag
