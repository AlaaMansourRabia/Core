import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {type ToolbarStat, ToolbarStats} from "@/components/ui/toolbar-stats";

// EV (earned value) metrics split into two divider-separated groups: percentages then currency.
const EV_GROUPS: ToolbarStat[][] = [
	[
		{label: "APPROVED", value: "0%"},
		{label: "PLANNED", value: "26.48%"},
		{label: "VARIANCE", value: "-26.48%", negative: true},
	],
	[
		{label: "BAC", value: "$551,117,394"},
		{label: "EV", value: "$0"},
		{label: "PV", value: "$145,921,414"},
		{label: "SV", value: "-$145,921,414", negative: true},
	],
];

// A single group has no divider — all tiles share the row equally.
const SINGLE_GROUP: ToolbarStat[][] = [
	[
		{label: "TOTAL", value: "1,248"},
		{label: "ACTIVE", value: "982"},
		{label: "IDLE", value: "266", negative: true},
	],
];

export function ToolbarStatsPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Toolbar Stats</h1>
					<CopyButton
						value="Toolbar Stats"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					A full-width row of bordered metric tiles — a caption over a bold value. Split the row into divider-separated
					sections with <code>groups</code>; values flagged <code>negative</code> render in the destructive color.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Earned value</CardTitle>
						<CopyButton
							value="Toolbar Stats - Earned value"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Two groups: percentage metrics (APPROVED / PLANNED / VARIANCE) and currency metrics (BAC / EV / PV / SV),
						separated by a vertical divider. Negative variance values use the destructive color.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:w-full">
						<ToolbarStats groups={EV_GROUPS} />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Table variant</CardTitle>
						<CopyButton
							value="Toolbar Stats - Table variant"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">variant=&quot;table&quot;</code> drops the
						separate tiles for a bare row of full-height cells split by full-height internal dividers — no gaps, no
						per-tile borders, and no outer outline.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:w-full">
						<ToolbarStats variant="table" groups={EV_GROUPS} />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Single group</CardTitle>
						<CopyButton
							value="Toolbar Stats - Single group"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>A single group of tiles shares the row equally with no divider.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:w-full">
						<ToolbarStats groups={SINGLE_GROUP} />
					</div>
				</CardContent>
			</Card>

			{/* API Reference */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Toolbar Stats - API Reference"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Props for the{" "}
						<code className="wwc:text-[13px] wwc:bg-muted wwc:px-1.5 wwc:py-0.5 wwc:rounded">{"<ToolbarStats>"}</code>{" "}
						component. Each tile is a{" "}
						<code className="wwc:text-[13px] wwc:bg-muted wwc:px-1.5 wwc:py-0.5 wwc:rounded">ToolbarStat</code>.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:overflow-x-auto">
						<table className="wwc:w-full wwc:text-[13px]">
							<thead>
								<tr className="wwc:border-b wwc:border-border">
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Prop</th>
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Type</th>
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Default</th>
									<th className="wwc:text-left wwc:py-3 wwc:font-semibold wwc:text-foreground">Description</th>
								</tr>
							</thead>
							<tbody>
								{[
									{
										prop: "groups",
										type: "ToolbarStat[][]",
										def: "—",
										desc: "Groups of stat tiles. Tiles in a group share the row width equally; a vertical divider separates one group from the next.",
									},
									{
										prop: "variant",
										type: '"cards" | "table"',
										def: '"cards"',
										desc: "cards: separate bordered tiles. table: one bordered container of full-height cells split by full-height dividers.",
									},
									{
										prop: "...props",
										type: "HTMLAttributes<HTMLDivElement>",
										def: "—",
										desc: "All standard div props (className, id, etc.) are forwarded to the root element.",
									},
								].map((row) => (
									<tr key={row.prop} className="wwc:border-b wwc:border-border wwc:last:border-b-0">
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-primary wwc:font-medium wwc:whitespace-nowrap">
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

					<p className="wwc:text-sm wwc:font-semibold wwc:text-foreground wwc:mt-6 wwc:mb-2">ToolbarStat</p>
					<div className="wwc:overflow-x-auto">
						<table className="wwc:w-full wwc:text-[13px]">
							<thead>
								<tr className="wwc:border-b wwc:border-border">
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Field</th>
									<th className="wwc:text-left wwc:py-3 wwc:pr-4 wwc:font-semibold wwc:text-foreground">Type</th>
									<th className="wwc:text-left wwc:py-3 wwc:font-semibold wwc:text-foreground">Description</th>
								</tr>
							</thead>
							<tbody>
								{[
									{field: "label", type: "string", desc: "Short caption above the value (rendered uppercase)."},
									{field: "value", type: "string", desc: 'Formatted value, e.g. "26.48%" or "$551,117,394".'},
									{
										field: "negative",
										type: "boolean",
										desc: "Render the value in the destructive/negative color (e.g. a negative variance).",
									},
								].map((row) => (
									<tr key={row.field} className="wwc:border-b wwc:border-border wwc:last:border-b-0">
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-primary wwc:font-medium wwc:whitespace-nowrap">
											{row.field}
										</td>
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-muted-foreground">{row.type}</td>
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
