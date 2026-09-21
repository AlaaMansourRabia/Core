import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {type MilestoneRow, MilestoneTable} from "@/components/ui/milestone-table";

const MILESTONES: MilestoneRow[] = [
	{id: "M35", color: "#7c3aed", actual: "Aug-26", planned: "Sep-26"},
	{id: "M50", color: "#2563eb", actual: "Nov-26", planned: "Dec-26"},
	{id: "M65", color: "#38bdf8", actual: "Jan-27", planned: "Feb-27"},
	{id: "M80", color: "#5eead4", actual: null, planned: "May-27"},
	{id: "M95", color: "#01b04a", actual: null, planned: "Nov-27"},
	{id: "M100", color: "#42ff01", actual: null, planned: "Dec-27"},
];

const propsTable: {prop: string; type: string; def: string; desc: string}[] = [
	{
		prop: "milestones",
		type: "MilestoneRow[]",
		def: "—",
		desc: "The milestone rows, in order (id, color swatch, actual, planned).",
	},
	{prop: "title", type: "ReactNode", def: '"Milestones"', desc: "Section title."},
	{
		prop: "collapsible",
		type: "boolean",
		def: "true",
		desc: "Wrap the table in a collapsible section with a toggle header. Set false for a static title + table.",
	},
	{prop: "defaultOpen", type: "boolean", def: "true", desc: "Initial open state (collapsible only)."},
	{
		prop: "columns",
		type: "[string, string, string]",
		def: '["Milestone", "Actual", "Planned"]',
		desc: "Column headers.",
	},
	{prop: "className", type: "string", def: "undefined", desc: "Extra classes merged onto the wrapper."},
];

export function MilestoneTablePage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Milestone Table</h1>
					<CopyButton
						value="Milestone Table"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:mt-2 wwc:max-w-2xl wwc:text-muted-foreground">
					A milestones table: one row per milestone with a colored swatch + id, its actual date (or “—” when not yet
					reached), and its planned date, with zebra striping. Complements the <strong>Progress Comparison</strong>{" "}
					milestone stepper when the exact dates matter.
				</p>
			</div>

			{/* Collapsible (default) */}
			<div>
				<h2 className="wwc:mb-1 wwc:text-xl wwc:font-semibold">Collapsible (default)</h2>
				<p className="wwc:mb-4 wwc:max-w-2xl wwc:text-muted-foreground">
					A toggle header shows / hides the table. Rows not yet reached render “—” for their actual date.
				</p>
				<div className="wwc:w-72">
					<MilestoneTable milestones={MILESTONES} />
				</div>
			</div>

			{/* Static */}
			<div>
				<h2 className="wwc:mb-1 wwc:text-xl wwc:font-semibold">Static</h2>
				<p className="wwc:mb-4 wwc:max-w-2xl wwc:text-muted-foreground">
					Pass <code>collapsible={"{false}"}</code> for a plain title + table with no toggle.
				</p>
				<div className="wwc:w-72">
					<MilestoneTable milestones={MILESTONES} collapsible={false} />
				</div>
			</div>

			{/* Props table */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Props</CardTitle>
						<CopyButton
							value="Milestone Table - Props"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<div className="wwc:overflow-x-auto">
						<table className="wwc:w-full wwc:text-sm">
							<thead>
								<tr className="wwc:border-b wwc:border-border wwc:text-left">
									<th className="wwc:py-2 wwc:pr-4 wwc:font-semibold">Prop</th>
									<th className="wwc:py-2 wwc:pr-4 wwc:font-semibold">Type</th>
									<th className="wwc:py-2 wwc:pr-4 wwc:font-semibold">Default</th>
									<th className="wwc:py-2 wwc:font-semibold">Description</th>
								</tr>
							</thead>
							<tbody>
								{propsTable.map((row) => (
									<tr key={row.prop} className="wwc:border-b wwc:border-border wwc:last:border-b-0">
										<td className="wwc:whitespace-nowrap wwc:py-3 wwc:pr-4 wwc:font-mono wwc:font-medium wwc:text-primary">
											{row.prop}
										</td>
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-muted-foreground">{row.type}</td>
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-muted-foreground">{row.def}</td>
										<td className="wwc:py-3 wwc:text-muted-foreground">{row.desc}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
