import type {Meta, StoryObj} from "storybook/internal/types";

import {NEUTRAL_TONE, TONES} from "@core/core-ui/tones";
import {Layers} from "lucide-react";

// Approximate OKLCH hue of each Tailwind family at 500 — what the palette's order walks around, and
// what the separation shown beside each row is measured on.
const HUE: Record<string, number> = {
	rose: 15,
	red: 25,
	orange: 55,
	amber: 75,
	yellow: 95,
	lime: 125,
	green: 145,
	emerald: 160,
	teal: 180,
	cyan: 195,
	sky: 210,
	blue: 260,
	indigo: 275,
	violet: 290,
	purple: 305,
	fuchsia: 320,
	pink: 345,
};
const apart = (a: string, b: string) => {
	const d = Math.abs(HUE[a] - HUE[b]);
	return Math.min(d, 360 - d);
};

function Chip({tone, className = ""}: {tone: string; className?: string}) {
	return (
		<span
			className={`wwc:flex wwc:h-[22px] wwc:w-[22px] wwc:shrink-0 wwc:items-center wwc:justify-center wwc:rounded-md ${tone} ${className}`}
		>
			<Layers className="wwc:h-[13px] wwc:w-[13px]" />
		</span>
	);
}

function TonesStory() {
	return (
		<div className="wwc:p-6">
			<p className="wwc:mb-5 wwc:max-w-[720px] wwc:text-[12px] wwc:text-muted-foreground">
				{TONES.length} tones, in the order <code>toneFor(index, offset)</code> hands them out. The order is a
				golden-angle walk around the hue wheel, so every consecutive pair is far apart — the number in the last column
				is the hue separation from the row above. Take them in order and no two items sitting next to each other can
				wear neighbouring hues.
			</p>

			<div className="wwc:grid wwc:gap-x-8 wwc:gap-y-2 wwc:grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
				{TONES.map((tone, i) => {
					const prev = i > 0 ? TONES[i - 1] : undefined;
					const gap = prev && prev.family !== tone.family ? apart(prev.family, tone.family) : undefined;
					return (
						<div key={tone.id} className="wwc:flex wwc:items-center wwc:gap-3">
							<span className="wwc:w-6 wwc:shrink-0 wwc:text-right wwc:text-[11px] wwc:tabular-nums wwc:text-muted-foreground/70">
								{i}
							</span>
							<Chip tone={tone.chip} />
							<code className="wwc:min-w-0 wwc:flex-1 wwc:truncate wwc:text-[12px] wwc:text-foreground">{tone.id}</code>
							<span className="wwc:shrink-0 wwc:text-[11px] wwc:text-muted-foreground/70">{tone.strength}</span>
							<span className="wwc:w-12 wwc:shrink-0 wwc:text-right wwc:text-[11px] wwc:tabular-nums wwc:text-muted-foreground/70">
								{gap === undefined ? "—" : `${gap}°`}
							</span>
						</div>
					);
				})}
			</div>

			<div className="wwc:mt-8 wwc:flex wwc:items-center wwc:gap-3">
				<span className="wwc:w-6 wwc:shrink-0" />
				<Chip tone={NEUTRAL_TONE} />
				<code className="wwc:text-[12px] wwc:text-foreground">NEUTRAL_TONE</code>
				<span className="wwc:text-[11px] wwc:text-muted-foreground/70">
					for an entry with no kind behind it — not part of the rotation
				</span>
			</div>

			<pre className="wwc:mt-8 wwc:overflow-x-auto wwc:rounded-lg wwc:bg-muted wwc:p-4 wwc:text-[11px] wwc:text-foreground">
				{`import {toneFor, TONE_BY_ID, NEUTRAL_TONE} from "@core/core-ui/tones";

// By position — consecutive items are never neighbouring hues.
// \`offset\` keeps two sections from opening on the same one.
items.map((item, i) => ({...item, tone: toneFor(i, sectionOffset)}))

// By id, where the hue carries a meaning rather than a rotation.
{id: "pipelines", label: "Pipelines", icon: Share2, tone: TONE_BY_ID.blue.chip}`}
			</pre>
		</div>
	);
}

const meta = {
	title: "Design Tokens/Tones",
	tags: ["autodocs", "!manifest"],
	parameters: {
		docs: {
			description: {
				component:
					"The tone palette: every soft tint the library hands out, in one place. A tone is a chip class string — a translucent fill of one hue with text in that hue, darkened for light mode and lightened for dark, the same shape the file system gives its file types and Badge gives its `*Soft` variants. `soft` is a 10% fill; `deep` a 25% fill a shade darker, which is how the palette reaches 25 from Tailwind's 17 colour families. **The order is the contract**: a golden-angle walk around the hue wheel, so consecutive entries are always far apart — hand them out with `toneFor(index, offset)` and two items next to each other can never land on neighbouring hues. Ask by id via `TONE_BY_ID` where a hue carries a meaning instead of a position. Append new tones, never insert: inserting renumbers every consumer and silently recolours surfaces that had nothing to do with the change. New class strings must also be added to the two hand-maintained prebuilt stylesheets, which have no generator.",
			},
		},
	},
	render: () => <TonesStory />,
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
