import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {CompareBars} from "@/components/ui/compare-bars";
import {CopyButton} from "@/components/ui/copy-button";

const propsTable: {prop: string; type: string; def: string; desc: string}[] = [
	{
		prop: "primary",
		type: "{ label: string; value: number }",
		def: "—",
		desc: "Left / primary source, rendered dark — most commonly the actual / approved value (0–100).",
	},
	{
		prop: "secondary",
		type: "{ label: string; value: number }",
		def: "—",
		desc: "Right / secondary source, rendered lighter — most commonly the planned / baseline value (0–100).",
	},
	{
		prop: "variance",
		type: "number",
		def: "primary − secondary",
		desc: "Value shown in the pill between the two hero percentages.",
	},
	{
		prop: "size",
		type: '"compact" | "default"',
		def: '"compact"',
		desc: "Density. compact matches the ProgressComparison panel; default is a touch larger.",
	},
	{prop: "className", type: "string", def: "undefined", desc: "Extra classes merged onto the wrapper."},
];

export function CompareBarsPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Compare Bars</h1>
					<CopyButton
						value="Compare Bars"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:mt-2 wwc:max-w-2xl wwc:text-muted-foreground">
					The dual-bar comparison primitive: two hero percentages (primary vs secondary) with a variance pill between
					them, a two-item legend, and a pair of stacked progress bars. This is the presentational core shared by the{" "}
					<strong>Progress Comparison</strong> widget — use it directly when you just need the bars block without the
					surrounding card / stats / header.
				</p>
			</div>

			{/* Behind — compact */}
			<div>
				<h2 className="wwc:mb-1 wwc:text-xl wwc:font-semibold">Behind plan (compact)</h2>
				<p className="wwc:mb-4 wwc:max-w-2xl wwc:text-muted-foreground">
					When <code>primary</code> is below <code>secondary</code>, the variance pill reads negative. The{" "}
					<code>compact</code> size matches the Progress Comparison panel.
				</p>
				<div className="wwc:w-72">
					<CompareBars primary={{label: "Approved", value: 83}} secondary={{label: "Planned", value: 89}} />
				</div>
			</div>

			{/* Ahead — default */}
			<div>
				<h2 className="wwc:mb-1 wwc:text-xl wwc:font-semibold">Ahead of plan (default)</h2>
				<p className="wwc:mb-4 wwc:max-w-2xl wwc:text-muted-foreground">
					When <code>primary</code> leads <code>secondary</code>, the pill reads positive. The <code>default</code> size
					is a touch larger.
				</p>
				<div className="wwc:w-80">
					<CompareBars
						primary={{label: "Approved", value: 72}}
						secondary={{label: "Planned", value: 60}}
						size="default"
					/>
				</div>
			</div>

			{/* Props table */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Props</CardTitle>
						<CopyButton
							value="Compare Bars - Props"
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
