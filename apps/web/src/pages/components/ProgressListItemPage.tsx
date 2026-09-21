import type {ReactNode} from "react";

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {ProgressListItem, type ProgressMetric} from "@/components/ui/progress-list-item";

// A bordered, white list container with divider lines between rows — how the rows appear in a real list.
function ListContainer({children}: {children: ReactNode[]}) {
	return (
		<div className="wwc:divide-y wwc:divide-border wwc:overflow-hidden wwc:rounded-lg wwc:border wwc:border-border wwc:bg-background">
			{children}
		</div>
	);
}

const evMetrics: ProgressMetric[] = [
	{label: "BAC", value: "181.6K"},
	{label: "EV", value: "165.8K"},
	{label: "PV", value: "181.6K"},
	{label: "SV", value: "-15.8K", tone: "negative"},
	{label: "Sch", value: "100%"},
];

const rollupMetrics: ProgressMetric[] = [
	{label: "BAC", value: "525.1M"},
	{label: "EV", value: "158.9M"},
	{label: "PV", value: "148.4M"},
	{label: "SV", value: "10.5M", tone: "positive"},
];

const propsTable: {prop: string; type: string; def: string; desc: string}[] = [
	{
		prop: "variant",
		type: '"generic" | "task" | "object"',
		def: "—",
		desc: "Tags the WBS level for semantics. All variants stack the name over its code; the props you pass decide what renders (badge, metrics, progress).",
	},
	{prop: "title", type: "string", def: "—", desc: "Primary bold identifier — the level's name."},
	{
		prop: "subtitle",
		type: "string",
		def: "undefined",
		desc: "Secondary muted text — the WBS code, shown beneath the name.",
	},
	{
		prop: "badge",
		type: '{ label: string; tone: "deviation" | "within" }',
		def: "undefined",
		desc: "Schedule / status pill beside the identifier. deviation → filled, within → bordered.",
	},
	{
		prop: "metrics",
		type: "ProgressMetric[]",
		def: "undefined",
		desc: 'Earned-value strip (label + value). tone "negative" → destructive, "positive" → success.',
	},
	{
		prop: "progress",
		type: "number",
		def: "undefined",
		desc: "Completion %. Renders a progress bar + percentage on the right.",
	},
	{prop: "tools", type: "number", def: "undefined", desc: "Linked-tool count, shown with the tree icon."},
	{
		prop: "onOpen",
		type: "() => void",
		def: "undefined",
		desc: "When set, the row becomes a focusable button that drills in (shows a chevron). Omit for leaf rows.",
	},
	{prop: "className", type: "string", def: "undefined", desc: "Extra classes merged onto the row element."},
];

export function ProgressListItemPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Progress List Item</h1>
					<CopyButton
						value="Progress List Item"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:mt-2 wwc:max-w-2xl wwc:text-muted-foreground">
					The shared row for a progress-details list. One component covers every WBS level via the <code>variant</code>{" "}
					prop — a <strong>generic</strong> grouping (zone / category / division), a <strong>task</strong> (the level
					with a progress bar + schedule badge), and an <strong>object</strong> under a task. Rows with an{" "}
					<code>onOpen</code> handler render as buttons that drill into the next level. (Operations are reviewed in the
					Operations Drawer rather than as rows.)
				</p>
			</div>

			{/* Generic */}
			<div>
				<h2 className="wwc:mb-1 wwc:text-xl wwc:font-semibold">Generic list item</h2>
				<p className="wwc:mb-4 wwc:max-w-2xl wwc:text-muted-foreground">
					A WBS grouping. The name stacks over its code, followed by an EV rollup + tool count. No progress bar.
				</p>
				<ListContainer>
					{[
						<ProgressListItem
							key="g1"
							variant="generic"
							title="Zone 1 - Block A"
							subtitle="MRM-RS-11-BL-2"
							metrics={rollupMetrics}
							tools={2111}
							onOpen={() => {}}
						/>,
						<ProgressListItem
							key="g2"
							variant="generic"
							title="Structural"
							subtitle="MRM-RS-20-BL-2"
							metrics={rollupMetrics}
							tools={10310}
							onOpen={() => {}}
						/>,
					]}
				</ListContainer>
			</div>

			{/* Task */}
			<div>
				<h2 className="wwc:mb-1 wwc:text-xl wwc:font-semibold">Task list item</h2>
				<p className="wwc:mb-4 wwc:max-w-2xl wwc:text-muted-foreground">
					A work item. Stacked like the other levels — the <strong>name</strong> is the label with its{" "}
					<strong>code</strong> beneath — with a schedule badge, the full EV strip, a progress bar, and a tool count.
				</p>
				<ListContainer>
					{[
						<ProgressListItem
							key="t1"
							variant="task"
							title="Earth work - Backfilling For Foundation"
							subtitle="RM-C-1A-B01-01-T-111"
							badge={{label: "+21.3% Schedule ahead", tone: "deviation"}}
							metrics={evMetrics}
							progress={79}
							tools={4}
							onOpen={() => {}}
						/>,
						<ProgressListItem
							key="t2"
							variant="task"
							title="Earth work - Excavation For PC"
							subtitle="RM-C-1A-B01-01-T-122"
							badge={{label: "Within 5%", tone: "within"}}
							metrics={evMetrics.map((m) => (m.label === "SV" ? {...m, value: "-176.9"} : m))}
							progress={95}
							tools={4}
							onOpen={() => {}}
						/>,
					]}
				</ListContainer>
			</div>

			{/* Object */}
			<div>
				<h2 className="wwc:mb-1 wwc:text-xl wwc:font-semibold">Object list item</h2>
				<p className="wwc:mb-4 wwc:max-w-2xl wwc:text-muted-foreground">
					A physical object under a task. Stacked like the generic row — the object <strong>name</strong> is the label
					with its <strong>code</strong> as the secondary line beneath — plus a metric strip, progress bar, and tool
					count.
				</p>
				<ListContainer>
					{[
						<ProgressListItem
							key="o1"
							variant="object"
							title="Precast Panel 1"
							subtitle="RM-C-1A-B01-01-T-111-O1"
							metrics={[
								{label: "BAC", value: "181.6K"},
								{label: "EV", value: "165.8K"},
							]}
							progress={77}
							tools={2}
							onOpen={() => {}}
						/>,
						<ProgressListItem
							key="o2"
							variant="object"
							title="Foundation Block 2"
							subtitle="RM-C-1A-B01-01-T-111-O2"
							metrics={[
								{label: "BAC", value: "92.4K"},
								{label: "EV", value: "70.1K"},
							]}
							progress={69}
							tools={3}
							onOpen={() => {}}
						/>,
					]}
				</ListContainer>
			</div>

			{/* Props table */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Props</CardTitle>
						<CopyButton
							value="Progress List Item - Props"
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
