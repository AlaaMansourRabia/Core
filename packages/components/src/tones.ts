/**
 * The tone palette: every soft tint the library has to hand out, in ONE place, in the order they
 * should be handed out.
 *
 * ── The formula ──────────────────────────────────────────────────────────────
 * A tone is a chip class string: a translucent fill of a hue, with text in that hue darkened for
 * light mode and lightened for dark. `soft` is a 10% fill, `deep` a 25% fill a shade darker — the
 * same shape the file system gives its file types and Badge gives its `*Soft` variants, so a tinted
 * square means the same thing wherever a reader meets it.
 *
 * Every string is written out in full rather than composed from a hue name at runtime: Tailwind scans
 * this source for literal class strings and emits nothing for a name it cannot see.
 *
 * ── The ORDER is the point ───────────────────────────────────────────────────
 * `TONES` is not alphabetical and not a rainbow. It is a golden-angle walk around the hue wheel, so
 * consecutive entries are always at least 125° apart. Hand tones out by taking entries in order and
 * two items that sit next to each other can never wear neighbouring hues — no blue beside sky, no
 * amber beside yellow. That is the whole reason this list has a fixed order: reorder it and the
 * guarantee is gone.
 *
 * Use {@link toneFor} rather than indexing by hand, so the wrap-around stays consistent.
 *
 * ── Adding to it ─────────────────────────────────────────────────────────────
 * A new tone must be appended, never inserted — inserting renumbers every consumer and silently
 * recolours surfaces that had nothing to do with the change. New class strings also need adding to the
 * two hand-maintained prebuilt stylesheets (`apps/studio/public/vendor/core-render.css` and
 * `integrations/open-design/renderer/core-render.css`), which have no generator — miss them and
 * Studio and open-design render the chip unstyled.
 */
export type Tone = {
	/** Stable id. `"blue"` is the soft tint; `"blue-deep"` the stronger one. */
	id: string;
	/** The Tailwind colour family behind it. */
	family: string;
	strength: "soft" | "deep";
	/** The class string to put on the chip. */
	chip: string;
};

/** All 25 tones, in hand-out order — consecutive entries are never neighbouring hues. */
export const TONES: Tone[] = [
	{id: "rose", family: "rose", strength: "soft", chip: "wwc:bg-rose-500/10 wwc:text-rose-700 wwc:dark:text-rose-400"},
	{
		id: "green",
		family: "green",
		strength: "soft",
		chip: "wwc:bg-green-500/10 wwc:text-green-700 wwc:dark:text-green-400",
	},
	{
		id: "indigo",
		family: "indigo",
		strength: "soft",
		chip: "wwc:bg-indigo-500/10 wwc:text-indigo-700 wwc:dark:text-indigo-400",
	},
	{
		id: "orange",
		family: "orange",
		strength: "soft",
		chip: "wwc:bg-orange-500/10 wwc:text-orange-700 wwc:dark:text-orange-400",
	},
	{id: "cyan", family: "cyan", strength: "soft", chip: "wwc:bg-cyan-500/10 wwc:text-cyan-700 wwc:dark:text-cyan-400"},
	{
		id: "fuchsia",
		family: "fuchsia",
		strength: "soft",
		chip: "wwc:bg-fuchsia-500/10 wwc:text-fuchsia-700 wwc:dark:text-fuchsia-400",
	},
	{
		id: "yellow",
		family: "yellow",
		strength: "soft",
		chip: "wwc:bg-yellow-500/10 wwc:text-yellow-700 wwc:dark:text-yellow-400",
	},
	{id: "blue", family: "blue", strength: "soft", chip: "wwc:bg-blue-500/10 wwc:text-blue-700 wwc:dark:text-blue-400"},
	{id: "red", family: "red", strength: "soft", chip: "wwc:bg-red-500/10 wwc:text-red-700 wwc:dark:text-red-400"},
	{
		id: "emerald",
		family: "emerald",
		strength: "soft",
		chip: "wwc:bg-emerald-500/10 wwc:text-emerald-700 wwc:dark:text-emerald-400",
	},
	{
		id: "violet",
		family: "violet",
		strength: "soft",
		chip: "wwc:bg-violet-500/10 wwc:text-violet-700 wwc:dark:text-violet-400",
	},
	{
		id: "amber",
		family: "amber",
		strength: "soft",
		chip: "wwc:bg-amber-500/10 wwc:text-amber-700 wwc:dark:text-amber-400",
	},
	{id: "sky", family: "sky", strength: "soft", chip: "wwc:bg-sky-500/10 wwc:text-sky-700 wwc:dark:text-sky-400"},
	{id: "pink", family: "pink", strength: "soft", chip: "wwc:bg-pink-500/10 wwc:text-pink-700 wwc:dark:text-pink-400"},
	{id: "lime", family: "lime", strength: "soft", chip: "wwc:bg-lime-500/10 wwc:text-lime-700 wwc:dark:text-lime-400"},
	{
		id: "purple",
		family: "purple",
		strength: "soft",
		chip: "wwc:bg-purple-500/10 wwc:text-purple-700 wwc:dark:text-purple-400",
	},
	{id: "teal", family: "teal", strength: "soft", chip: "wwc:bg-teal-500/10 wwc:text-teal-700 wwc:dark:text-teal-400"},
	{
		id: "rose-deep",
		family: "rose",
		strength: "deep",
		chip: "wwc:bg-rose-500/25 wwc:text-rose-800 wwc:dark:text-rose-300",
	},
	{
		id: "green-deep",
		family: "green",
		strength: "deep",
		chip: "wwc:bg-green-500/25 wwc:text-green-800 wwc:dark:text-green-300",
	},
	{
		id: "indigo-deep",
		family: "indigo",
		strength: "deep",
		chip: "wwc:bg-indigo-500/25 wwc:text-indigo-800 wwc:dark:text-indigo-300",
	},
	{
		id: "orange-deep",
		family: "orange",
		strength: "deep",
		chip: "wwc:bg-orange-500/25 wwc:text-orange-800 wwc:dark:text-orange-300",
	},
	{
		id: "cyan-deep",
		family: "cyan",
		strength: "deep",
		chip: "wwc:bg-cyan-500/25 wwc:text-cyan-800 wwc:dark:text-cyan-300",
	},
	{
		id: "fuchsia-deep",
		family: "fuchsia",
		strength: "deep",
		chip: "wwc:bg-fuchsia-500/25 wwc:text-fuchsia-800 wwc:dark:text-fuchsia-300",
	},
	{
		id: "yellow-deep",
		family: "yellow",
		strength: "deep",
		chip: "wwc:bg-yellow-500/25 wwc:text-yellow-800 wwc:dark:text-yellow-300",
	},
	{
		id: "blue-deep",
		family: "blue",
		strength: "deep",
		chip: "wwc:bg-blue-500/25 wwc:text-blue-800 wwc:dark:text-blue-300",
	},
];

/** By id, for a surface that wants a specific hue rather than the next one in the rotation. */
export const TONE_BY_ID: Record<string, Tone> = Object.fromEntries(TONES.map((t) => [t.id, t]));

/**
 * The chip for a neutral entry — something with no kind behind it. The file system uses this for
 * anything that is not a file type, and a nav uses it for an entry that owns no record kind (a
 * marketplace, say): a hue there would promise a kind that does not exist.
 */
export const NEUTRAL_TONE = "wwc:bg-muted wwc:text-foreground/70";

/**
 * The tone for the nth item of a set, wrapping when a set is longer than the palette.
 *
 * `offset` shifts where a set starts in the rotation — pass a group's index and two groups rendered
 * one above the other will not both open on the same hue. Within one set, consecutive `index` values
 * are guaranteed to be far apart on the wheel.
 */
export function toneFor(index: number, offset = 0): string {
	const i = (((index + offset) % TONES.length) + TONES.length) % TONES.length;
	return TONES[i].chip;
}
