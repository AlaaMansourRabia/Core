import {Maximize2} from "lucide-react";
import {useState} from "react";

import {
	Breadcrumb,
	BreadcrumbEllipsis,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {Button} from "@/components/ui/button";
import {CanvasHeader} from "@/components/ui/canvas-header";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {type WeekSelectorWeek} from "@/components/ui/week-selector";

const WEEKS: WeekSelectorWeek[] = [
	{value: "W109", start: new Date(2026, 5, 12), end: new Date(2026, 5, 18)},
	{value: "W110", start: new Date(2026, 5, 19), end: new Date(2026, 5, 25)},
	{value: "W111", start: new Date(2026, 5, 26), end: new Date(2026, 6, 2)},
	{value: "W112", start: new Date(2026, 6, 3), end: new Date(2026, 6, 9)},
	{value: "W113", start: new Date(2026, 6, 10), end: new Date(2026, 6, 16)},
	{value: "W114", start: new Date(2026, 6, 17), end: new Date(2026, 6, 23)},
	{value: "W115", start: new Date(2026, 6, 24), end: new Date(2026, 6, 30)},
];

function Crumbs() {
	return (
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink href="#">Riverside Compound</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbEllipsis items={[{label: "Zone A — Waterfront"}]} />
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbLink href="#">HOUSE-A01</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbPage>Ground Floor</BreadcrumbPage>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>
	);
}

function FullScreenButton() {
	return (
		<Button type="button" variant="outline" icon size="sm" aria-label="Full screen">
			<Maximize2 className="wwc:h-4 wwc:w-4" />
		</Button>
	);
}

const propsTable: {prop: string; type: string; def: string; desc: string}[] = [
	{
		prop: "left",
		type: "ReactNode",
		def: "undefined",
		desc: "Left cluster — typically a Breadcrumb. Takes the free width and stays on a single line.",
	},
	{
		prop: "center",
		type: "ReactNode",
		def: "undefined",
		desc: "Optional centered cluster (e.g. a title or a segmented control).",
	},
	{
		prop: "right",
		type: "ReactNode",
		def: "undefined",
		desc: "Right cluster actions (e.g. a full-screen Button), placed after the built-in weekSelector.",
	},
	{
		prop: "weekSelector",
		type: "WeekSelectorProps",
		def: "undefined",
		desc: "Built-in period selector at the start of the right cluster — pass the WeekSelector's props; it renders bare so it sits flush.",
	},
	{prop: "className", type: "string", def: "undefined", desc: "Extra classes merged onto the header element."},
];

export function CanvasHeaderPage() {
	const [week, setWeek] = useState("W112");

	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Canvas Header</h1>
					<CopyButton
						value="Canvas Header"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:mt-2 wwc:max-w-2xl wwc:text-muted-foreground">
					The canvas-level header bar: a bordered <code>min-h-12</code> row with a <code>left</code> cluster (breadcrumb
					— takes the free width, stays on one line, truncates when tight), an optional centered cluster, and a{" "}
					<code>right</code> cluster (an optional built-in <code>weekSelector</code> + your actions). It heads a single
					workspace canvas — distinct from the platform <strong>App Top Bar</strong> — and pairs with{" "}
					<strong>View Tab Bar</strong> and <strong>Canvas Toolbar</strong>.
				</p>
			</div>

			{/* Default */}
			<div>
				<h2 className="wwc:mb-1 wwc:text-xl wwc:font-semibold">Breadcrumb + action</h2>
				<p className="wwc:mb-4 wwc:max-w-2xl wwc:text-muted-foreground">
					A <code>left</code> breadcrumb and a <code>right</code> full-screen action.
				</p>
				<div className="wwc:overflow-hidden wwc:rounded-lg wwc:border wwc:border-border">
					<CanvasHeader left={<Crumbs />} right={<FullScreenButton />} />
				</div>
			</div>

			{/* With week selector */}
			<div>
				<h2 className="wwc:mb-1 wwc:text-xl wwc:font-semibold">With week selector</h2>
				<p className="wwc:mb-4 wwc:max-w-2xl wwc:text-muted-foreground">
					Pass <code>weekSelector</code> to dock a period selector at the start of the right cluster — rendered{" "}
					<code>bare</code> so it sits flush, before your <code>right</code> actions.
				</p>
				<div className="wwc:overflow-hidden wwc:rounded-lg wwc:border wwc:border-border">
					<CanvasHeader
						left={<Crumbs />}
						weekSelector={{weeks: WEEKS, value: week, onValueChange: setWeek, visibleCount: 4}}
						right={<FullScreenButton />}
					/>
				</div>
			</div>

			{/* Props table */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Props</CardTitle>
						<CopyButton
							value="Canvas Header - Props"
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
