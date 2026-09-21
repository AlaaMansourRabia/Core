import type {Meta, StoryObj} from "storybook/internal/types";

import {
	TypographyBlockquote,
	TypographyH1,
	TypographyH2,
	TypographyH3,
	TypographyH4,
	TypographyInlineCode,
	TypographyLarge,
	TypographyLead,
	TypographyMuted,
	TypographyP,
	TypographySmall,
} from "@core/core-ui/typography";

const meta = {
	title: "Components/Data Display/Typography",
	component: TypographyP,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Typography components for consistent text styling. Includes headings (H1-H4), paragraph, blockquote, inline code, lead, large, small, and muted text variants.",
			},
		},
	},
} satisfies Meta<typeof TypographyP>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<div className="wwc:space-y-6">
			<TypographyH1>Heading 1</TypographyH1>
			<TypographyH2>Heading 2</TypographyH2>
			<TypographyH3>Heading 3</TypographyH3>
			<TypographyH4>Heading 4</TypographyH4>
			<TypographyP>
				This is a paragraph. The king, seeing how much happier his subjects were, realized the error of his ways and
				repealed the decree.
			</TypographyP>
		</div>
	),
};

export const Headings: Story = {
	render: () => (
		<div className="wwc:space-y-4">
			<TypographyH1>The Joke Tax Chronicles</TypographyH1>
			<TypographyH2>The People of the Kingdom</TypographyH2>
			<TypographyH3>The Joke Tax</TypographyH3>
			<TypographyH4>People stopped telling jokes</TypographyH4>
		</div>
	),
};

export const Paragraph: Story = {
	render: () => (
		<div>
			<TypographyP>
				The king, seeing how much happier his subjects were, realized the error of his ways and repealed the decree.
				People could once again freely exchange jokes and laughter.
			</TypographyP>
			<TypographyP>
				The kingdom flourished, and the people lived happily ever after, sharing stories and humor without fear of
				taxation.
			</TypographyP>
		</div>
	),
};

export const Blockquote: Story = {
	render: () => (
		<TypographyBlockquote>
			After all, he thought, everyone enjoyed a good joke, so it was hardly fair to tax them for it.
		</TypographyBlockquote>
	),
};

export const InlineCode: Story = {
	render: () => (
		<TypographyP>
			Use the <TypographyInlineCode>{"<Alert>"}</TypographyInlineCode> component to show important messages.
		</TypographyP>
	),
};

export const TextVariants: Story = {
	render: () => (
		<div className="wwc:space-y-4">
			<TypographyLead>A lead paragraph that stands out from the rest of the content.</TypographyLead>
			<TypographyLarge>Large text for emphasis</TypographyLarge>
			<TypographySmall>Small text for details</TypographySmall>
			<TypographyMuted>Muted text for secondary information</TypographyMuted>
		</div>
	),
};

export const AllVariants: Story = {
	render: () => (
		<div className="wwc:space-y-6">
			<TypographyH1>Typography Showcase</TypographyH1>
			<TypographyLead>This lead text introduces the content with larger styling.</TypographyLead>
			<TypographyH2>Section Heading</TypographyH2>
			<TypographyP>Regular paragraph text with standard styling. This is how most body content appears.</TypographyP>
			<TypographyH3>Subsection</TypographyH3>
			<TypographyBlockquote>A blockquote stands out with a left border and italic text.</TypographyBlockquote>
			<TypographyH4>Details</TypographyH4>
			<TypographyP>
				Code can be displayed inline with <TypographyInlineCode>monospace styling</TypographyInlineCode> applied.
			</TypographyP>
			<TypographyLarge>Large text for important callouts</TypographyLarge>
			<TypographySmall>Small text for fine print or details</TypographySmall>
			<TypographyMuted>Muted text for supplementary information</TypographyMuted>
		</div>
	),
};

// Visual regression for the SELF-HOSTED typefaces (#208). Core declares Figtree / IBM Plex Mono /
// Lora as tokens; before these shipped as bundled WOFF2 they came from a CDN @import, so an offline or
// CSP-restricted host silently rendered a system fallback while still looking token-compliant. This
// story pins representative headings, body copy, table text, tabular numerals and compact nav text so
// that regression is caught as a pixel diff rather than going unnoticed.
export const FontResources: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"Every declared family, rendered from the WOFF2 files bundled in `@core/core-tokens` — no runtime request to a third-party host. If the fonts ever stop resolving, this story falls back to a system stack and the diff shows it.",
			},
		},
	},
	render: () => (
		<div className="wwc:space-y-6 wwc:p-6">
			<div className="wwc:space-y-1">
				<h1 className="wwc:text-4xl wwc:font-bold wwc:tracking-tight">Falcon Heights Medical Tower</h1>
				<h2 className="wwc:text-2xl wwc:font-semibold">Workforce compliance, week 34</h2>
				<h3 className="wwc:text-lg wwc:font-medium">Zone B — night shift</h3>
			</div>

			<p className="wwc:max-w-[62ch] wwc:text-sm wwc:text-muted-foreground">
				Sans body copy in Figtree. The quick brown fox jumps over the lazy dog — 0123456789 — and a few accented glyphs
				from the latin-ext subset: àâçéèêëîïôùûüÿ ĄĆĘŁŃÓŚŹŻ.
			</p>

			<div className="wwc:flex wwc:gap-6 wwc:text-[13px]">
				{["300", "400", "500", "600", "700", "800", "900"].map((w) => (
					<span key={w} style={{fontWeight: Number(w)}}>
						Aa {w}
					</span>
				))}
			</div>

			<table className="wwc:w-full wwc:max-w-[520px] wwc:text-sm">
				<thead>
					<tr className="wwc:border-b wwc:text-left wwc:text-muted-foreground">
						<th className="wwc:py-2 wwc:font-medium">Crew</th>
						<th className="wwc:py-2 wwc:text-right wwc:font-medium">On site</th>
						<th className="wwc:py-2 wwc:text-right wwc:font-medium">Hours</th>
					</tr>
				</thead>
				<tbody>
					{[
						["Steel fixing", 142, "1,184.50"],
						["Formwork", 87, "712.25"],
						["MEP rough-in", 1109, "9,043.75"],
					].map(([crew, n, hours]) => (
						<tr key={crew as string} className="wwc:border-b wwc:last:border-0">
							<td className="wwc:py-2">{crew}</td>
							<td className="wwc:py-2 wwc:text-right wwc:tabular-nums">{n}</td>
							<td className="wwc:py-2 wwc:text-right wwc:tabular-nums">{hours}</td>
						</tr>
					))}
				</tbody>
			</table>

			<div className="wwc:flex wwc:gap-6">
				<div className="wwc:space-y-1">
					<div className="wwc:text-[10px] wwc:font-semibold wwc:uppercase wwc:tracking-widest wwc:text-muted-foreground/60">
						Compact nav
					</div>
					{["Site Reality", "Safety Manager", "Observation Manager"].map((label) => (
						<div key={label} className="wwc:text-[13px]">
							{label}
						</div>
					))}
				</div>
				<div className="wwc:space-y-1">
					<div className="wwc:text-[10px] wwc:font-semibold wwc:uppercase wwc:tracking-widest wwc:text-muted-foreground/60">
						Mono — var(--font-mono)
					</div>
					<code className="wwc:font-mono wwc:text-[13px]">const permitId = "PT-706";</code>
					<div className="wwc:font-mono wwc:text-[13px] wwc:tabular-nums">0123456789 · 00001006-a99a</div>
				</div>
				<div className="wwc:space-y-1">
					<div className="wwc:text-[10px] wwc:font-semibold wwc:uppercase wwc:tracking-widest wwc:text-muted-foreground/60">
						Serif — var(--font-serif)
					</div>
					<p className="wwc:font-serif wwc:text-[15px]">Handgloves — quarterly progress narrative.</p>
				</div>
			</div>
		</div>
	),
};
