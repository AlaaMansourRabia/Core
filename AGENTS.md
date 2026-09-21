<!-- intent-skills:start -->
## Skill Loading

Before editing files for a substantial task:
- Run `pnpm dlx @tanstack/intent@latest list` from the workspace root to see available local skills.
- If a listed skill matches the task, run `pnpm dlx @tanstack/intent@latest load <package>#<skill>` before changing files.
- Use the loaded `SKILL.md` guidance while making the change.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.
<!-- intent-skills:end -->

## Composition & component selection

When deciding **which** Wakecore component to use, or composing several into a screen, load `core-ui-composition` first (component selection guides, composition rules, and workflow recipes), then the specific domain skill. The machine-readable when/why catalog is **`library-index.json`** — each component has `intent` / `when` / `chooseOver` / `requires` / `variantIntent` (and a `knowledgeLevel`), plus a `patterns[]` catalog of composition recipes. Regenerate its structural fields with `node scripts/extract-component-catalog.mjs && node scripts/sync-library-index.mjs`.
