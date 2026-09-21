// Shared catalog resolution — single source of truth for mapping a Storybook story title to its
// entry in the repo-root library-index.json. Used by the ComponentKnowledge docs block and (via the
// generated component-pages.json) by the Components/Overview index. See title-aliases.json.

import aliasesJson from "./title-aliases.json";

type Aliases = Record<string, string>;
// Drop "_comment" / "_group_*" documentation keys; keep only real leaf → name mappings.
const aliases: Aliases = Object.fromEntries(Object.entries(aliasesJson as Aliases).filter(([k]) => !k.startsWith("_")));

/** Story-title leaf (e.g. "Date Picker") → catalog name (e.g. "DatePicker"). Reviewed, explicit. */
export const TITLE_TO_CATALOG: Aliases = aliases;

/** Inverse: catalog name → preferred display leaf (only for the aliased entries). */
export const CATALOG_TO_LEAF: Aliases = Object.fromEntries(Object.entries(aliases).map(([leaf, name]) => [name, leaf]));

/** Normalize a label for tolerant matching: lowercase, strip non-alphanumerics. */
export const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * Resolve a Storybook story title (e.g. "Components/Forms/Date Picker") to its catalog name.
 * Resolution order: explicit alias table → exact name → normalized (space/case) match.
 * `names` is the set of valid catalog names. Returns undefined when no entry exists.
 */
export function resolveCatalogName(title: string | undefined, names: string[]): string | undefined {
	if (!title) return undefined;
	const leaf = title.split("/").pop()!.trim();
	if (TITLE_TO_CATALOG[leaf]) return TITLE_TO_CATALOG[leaf];
	if (names.includes(leaf)) return leaf;
	const byNorm = norm(leaf);
	return names.find((n) => norm(n) === byNorm);
}
