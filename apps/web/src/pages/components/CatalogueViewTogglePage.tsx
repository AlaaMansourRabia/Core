import * as React from "react";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CatalogueCardGrid, CatalogueViewToggle, type CatalogueViewMode} from "@/components/ui/catalogue-view-toggle";
import {CopyButton} from "@/components/ui/copy-button";

const ROWS = [
	{id: "p1", name: "Digital Work Permit", backing: "Work Permit", states: 7},
	{id: "p2", name: "Observation Manager", backing: "Safety Observation", states: 5},
	{id: "p3", name: "Lifting plan approval", backing: "Lift Plan", states: 4},
];

function Example() {
	const [mode, setMode] = React.useState<CatalogueViewMode>("cards");
	return (
		<div className="wwc:space-y-4">
			<div className="wwc:flex wwc:items-center wwc:justify-between">
				<span className="wwc:text-muted-foreground wwc:text-sm">
					Showing {ROWS.length} processes as <b className="wwc:text-foreground">{mode}</b>
				</span>
				<CatalogueViewToggle value={mode} onValueChange={setMode} />
			</div>
			{mode === "cards" ? (
				<CatalogueCardGrid>
					{ROWS.map((row) => (
						<Card key={row.id} className="wwc:p-3">
							<h3 className="wwc:text-sm wwc:font-medium">{row.name}</h3>
							<p className="wwc:text-muted-foreground wwc:text-xs">
								{row.backing} · {row.states} states
							</p>
						</Card>
					))}
				</CatalogueCardGrid>
			) : (
				<table className="wwc:w-full wwc:text-sm">
					<thead>
						<tr className="wwc:text-muted-foreground wwc:border-b wwc:text-xs">
							<th className="wwc:py-2 wwc:text-left">Name</th>
							<th className="wwc:py-2 wwc:text-left">Backing object type</th>
							<th className="wwc:py-2 wwc:text-right">States</th>
						</tr>
					</thead>
					<tbody>
						{ROWS.map((row) => (
							<tr key={row.id} className="wwc:border-b">
								<td className="wwc:py-2">{row.name}</td>
								<td className="wwc:text-muted-foreground wwc:py-2">{row.backing}</td>
								<td className="wwc:py-2 wwc:text-right wwc:tabular-nums">{row.states}</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</div>
	);
}

export function CatalogueViewTogglePage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">CatalogueViewToggle</h1>
					<CopyButton
						value="CatalogueViewToggle"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Persisted table-or-cards switch for a catalogue page, plus the responsive grid its cards land in.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Default</CardTitle>
					<CardDescription>
						Press the live option again — the de-select is swallowed, because a catalogue always has a mode.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Example />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Why it does not wrap DataTable</CardTitle>
					<CardDescription>
						One <code>DataTable</code> must stay mounted for the life of the view — its sorting, page index and column
						visibility live in its own state. Let <code>mode</code> reach it through exactly two props,
						<code> showColumnToggle</code> and <code>renderGrid</code>, and never render a table or a grid
						conditionally.
					</CardDescription>
				</CardHeader>
			</Card>
		</div>
	);
}
