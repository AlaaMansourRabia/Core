import type {Meta, StoryObj} from "storybook/internal/types";

import {Card} from "@wakecap/core-ui/card";
import {CatalogueCardGrid, CatalogueViewToggle, type CatalogueViewMode} from "@wakecap/core-ui/catalogue-view-toggle";
import {useState} from "react";

const ROWS = [
	{id: "p1", name: "Digital Work Permit", backing: "Work Permit", states: 7},
	{id: "p2", name: "Observation Manager", backing: "Safety Observation", states: 5},
	{id: "p3", name: "Lifting plan approval", backing: "Lift Plan", states: 4},
];

const meta = {
	title: "Components/Navigation/Catalogue View Toggle",
	component: CatalogueViewToggle,
	tags: ["autodocs"],
	parameters: {
		layout: "padded",
		docs: {
			description: {
				component:
					"The table-or-cards switch four catalogue pages had each re-typed, plus the responsive grid its cards land in and the hook that persists the choice. Deliberately **not** a whole catalogue component: `DataTable` already owns the search box, filter chips, empty state and paging, and wrapping it would break the invariant those pages protect in comments — one `DataTable` stays mounted for the life of the view, so its sorting, page index and column visibility survive a mode change. `mode` should reach `DataTable` through exactly two props, `showColumnToggle` and `renderGrid`, and nothing else.",
			},
		},
	},
} satisfies Meta<typeof CatalogueViewToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Press the live option again — the de-select is swallowed, because a catalogue always has a mode. */
export const Default: Story = {
	render: () => {
		const [mode, setMode] = useState<CatalogueViewMode>("cards");
		return (
			<div className="wwc:space-y-4">
				<div className="wwc:flex wwc:items-center wwc:justify-between">
					<span className="wwc:text-sm wwc:text-muted-foreground">
						Showing {ROWS.length} processes as <b className="wwc:text-foreground">{mode}</b>
					</span>
					<CatalogueViewToggle value={mode} onValueChange={setMode} />
				</div>

				{mode === "cards" ? (
					<CatalogueCardGrid>
						{ROWS.map((row) => (
							<Card key={row.id} className="wwc:p-3">
								<h3 className="wwc:text-sm wwc:font-medium">{row.name}</h3>
								<p className="wwc:text-xs wwc:text-muted-foreground">
									{row.backing} · {row.states} states
								</p>
							</Card>
						))}
					</CatalogueCardGrid>
				) : (
					<table className="wwc:w-full wwc:text-sm">
						<thead>
							<tr className="wwc:border-b wwc:text-xs wwc:text-muted-foreground">
								<th className="wwc:py-2 wwc:text-left">Name</th>
								<th className="wwc:py-2 wwc:text-left">Backing object type</th>
								<th className="wwc:py-2 wwc:text-right">States</th>
							</tr>
						</thead>
						<tbody>
							{ROWS.map((row) => (
								<tr key={row.id} className="wwc:border-b">
									<td className="wwc:py-2">{row.name}</td>
									<td className="wwc:py-2 wwc:text-muted-foreground">{row.backing}</td>
									<td className="wwc:py-2 wwc:text-right wwc:tabular-nums">{row.states}</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>
		);
	},
};

/** The grid alone: one column on a phone, two from `sm`, three from `xl`. */
export const CardGrid: Story = {
	render: () => (
		<CatalogueCardGrid>
			{ROWS.map((row) => (
				<Card key={row.id} className="wwc:p-3">
					<h3 className="wwc:text-sm wwc:font-medium">{row.name}</h3>
					<p className="wwc:text-xs wwc:text-muted-foreground">{row.backing}</p>
				</Card>
			))}
		</CatalogueCardGrid>
	),
};
