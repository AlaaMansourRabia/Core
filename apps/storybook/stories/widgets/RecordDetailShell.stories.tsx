import type {Meta, StoryObj} from "storybook/internal/types";

import {Card, CardContent} from "@wakecap/core-ui/card";
import {RecordDetailShell} from "@wakecap/core-ui/record-detail-shell";
import {useState} from "react";

const SECTIONS = [
	{
		items: [
			{id: "overview", label: "Overview"},
			{id: "properties", label: "Properties"},
			{id: "datasources", label: "Datasources"},
			{id: "metadata", label: "Metadata"},
			{id: "permissions", label: "Permissions"},
			{id: "canvas", label: "Canvas"},
		],
	},
];

const meta = {
	title: "Widgets/Navigation/Record Detail Shell",
	component: RecordDetailShell,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"Left section rail beside a single scrolling content column. **Only reach for this when the record genuinely has a lot of detail** — a record with three short sections stacks them full-width and needs no rail at all; a rail over two screens of content is chrome, not navigation. The shell owns the three details four detail pages each re-derived: the `md`-breakpoint column flip, the `min-h-0` chain that keeps the column scrolling instead of the page, and an unpadded scroll owner wrapping a padded well. It deliberately does **not** own the page header above it — every record's header carries its own identity and actions.",
			},
		},
	},
} satisfies Meta<typeof RecordDetailShell>;

export default meta;
type Story = StoryObj<typeof meta>;

function Filler({section}: {section: string}) {
	return (
		<>
			{Array.from({length: 8}, (_, i) => (
				<Card key={i}>
					<CardContent className="wwc:p-4">
						<h3 className="wwc:text-sm wwc:font-medium wwc:capitalize">
							{section} · block {i + 1}
						</h3>
						<p className="wwc:mt-1 wwc:text-xs wwc:text-muted-foreground">
							Scroll the column — the rail stays put and the page itself never scrolls.
						</p>
					</CardContent>
				</Card>
			))}
		</>
	);
}

/** Six sections, one at a time. Scroll the content — the rail does not move. */
export const Default: Story = {
	render: () => {
		const [section, setSection] = useState("overview");
		return (
			<div className="wwc:flex wwc:h-screen wwc:flex-col">
				<div className="wwc:shrink-0 wwc:border-b wwc:px-6 wwc:py-4">
					<h1 className="wwc:text-lg wwc:font-semibold">Work Permit</h1>
					<p className="wwc:text-xs wwc:text-muted-foreground">
						The page header stays with the page — the shell owns only the rail and the column.
					</p>
				</div>
				<RecordDetailShell
					title="Object type"
					sections={SECTIONS}
					activeSectionId={section}
					onSectionChange={setSection}
				>
					<Filler section={section} />
				</RecordDetailShell>
			</div>
		);
	},
};

/**
 * `flush` places the section as a direct flex child instead of inside the padded, scrolling well —
 * for a section that owns the page height itself, such as a full-bleed graph canvas. Pick **Canvas**.
 */
export const FlushSection: Story = {
	render: () => {
		const [section, setSection] = useState("canvas");
		return (
			<div className="wwc:flex wwc:h-screen wwc:flex-col">
				<RecordDetailShell
					title="Process"
					sections={SECTIONS}
					activeSectionId={section}
					onSectionChange={setSection}
					flush={section === "canvas"}
				>
					{section === "canvas" ? (
						<div className="wwc:m-6 wwc:flex wwc:min-h-0 wwc:flex-1 wwc:items-center wwc:justify-center wwc:rounded-lg wwc:border wwc:border-dashed wwc:bg-muted/20 wwc:text-sm wwc:text-muted-foreground">
							A canvas that fills the remaining height and scrolls nothing.
						</div>
					) : (
						<Filler section={section} />
					)}
				</RecordDetailShell>
			</div>
		);
	},
};
