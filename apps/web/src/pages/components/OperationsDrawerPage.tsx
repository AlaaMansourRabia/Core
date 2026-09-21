import {useState} from "react";

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {OperationsDrawer} from "@/components/ui/operations-drawer";

const propsTable: {prop: string; type: string; def: string; desc: string}[] = [
	{prop: "title", type: "string", def: "—", desc: "Bold object identifier shown top-left."},
	{prop: "wbs", type: "string", def: "—", desc: "Full WBS path, shown muted beneath the title."},
	{prop: "progress", type: "number", def: "—", desc: "Overall completion (0–100) for the header progress bar."},
	{
		prop: "page",
		type: "{ current: number; total: number }",
		def: "undefined",
		desc: "Optional object pager (‹ 1 / 4 ›) beside the title.",
	},
	{
		prop: "rows",
		type: "OperationRow[]",
		def: "—",
		desc: "Operation lines: name + code, WT / PREV / BAC / EV metrics, and an editable progress value.",
	},
	{
		prop: "onWalkthrough / onClose / onPrev / onNext",
		type: "() => void",
		def: "undefined",
		desc: "Header action handlers (walkthrough button, close, and pager).",
	},
	{
		prop: "onDiscard / onSave",
		type: "() => void",
		def: "undefined",
		desc: "Footer action handlers for the Discard and Save changes buttons.",
	},
	{prop: "className", type: "string", def: "undefined", desc: "Extra classes merged onto the drawer container."},
];

export function OperationsDrawerPage() {
	const [progress, setProgress] = useState<Record<string, string>>({"BF-01": "100%", "BWBF-01": "0%"});

	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Operations Drawer</h1>
					<CopyButton
						value="Operations Drawer"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:mt-2 wwc:max-w-2xl wwc:text-muted-foreground">
					A drawer for reviewing and updating the operations under a single object. The header carries the object
					identifier, its WBS path, an overall progress bar, and a walkthrough button; a compact table lists each
					operation with its WT / PREV / BAC / EV metrics and an editable progress field; the footer discards or saves
					the changes (Save stays disabled until a progress value changes). Composed from Core <code>Table</code>,{" "}
					<code>Progress</code>, <code>Input</code>, and <code>Button</code>.
				</p>
			</div>

			<div>
				<h2 className="wwc:mb-1 wwc:text-xl wwc:font-semibold">Compact table</h2>
				<p className="wwc:mb-4 wwc:max-w-2xl wwc:text-muted-foreground">
					The progress fields are editable. Fixed to a 440px drawer width; the table area scrolls when the operation
					list overflows.
				</p>
				<div className="wwc:h-[560px] wwc:w-fit wwc:rounded-b-lg wwc:bg-muted/30 wwc:p-4">
					<OperationsDrawer
						title="2266-DP1-R-SS"
						wbs="MRM-RS-02-BL-1.CON.Zone 1 – A.1.Block-XX.T.2266.SS"
						progress={50}
						page={{current: 1, total: 4}}
						rows={[
							{
								name: "Backfill",
								code: "BF-01",
								wt: "50%",
								prev: "100%",
								bac: "25.1K",
								ev: "25.1K",
								progress: progress["BF-01"],
								onProgressChange: (v) => setProgress((p) => ({...p, "BF-01": v})),
							},
							{
								name: "Boundary Wall Backfill",
								code: "BWBF-01",
								wt: "50%",
								prev: "0%",
								bac: "25.1K",
								ev: "0",
								progress: progress["BWBF-01"],
								onProgressChange: (v) => setProgress((p) => ({...p, "BWBF-01": v})),
							},
						]}
					/>
				</div>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Props</CardTitle>
						<CopyButton
							value="Operations Drawer - Props"
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
