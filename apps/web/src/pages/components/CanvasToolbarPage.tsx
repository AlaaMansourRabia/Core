import type {DrawingToolId, LineKind, PinKind, ShapeKind} from "@corensystem/coren-ui/drawing-actions";

import {useState} from "react";

import {CanvasToolbar, type CanvasToolbarBlueprint} from "@/components/ui/canvas-toolbar";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";

const sampleBlueprints: CanvasToolbarBlueprint[] = [
	{id: "ground", name: "Retail_1__Ground_Floor.svg"},
	{id: "mezzanine", name: "Retail_1__Mezzanine.svg"},
	{id: "roof", name: "Retail_1__Roof.svg"},
];

const longBlueprintList: CanvasToolbarBlueprint[] = [
	{id: "ground", name: "Retail_1__Ground_Floor.svg"},
	{id: "mezzanine", name: "Retail_1__Mezzanine.svg"},
	{id: "l1", name: "Office_Tower__L1.svg"},
	{id: "l2", name: "Office_Tower__L2.svg"},
	{id: "l3", name: "Office_Tower__L3.svg"},
	{id: "l4", name: "Office_Tower__L4.svg"},
	{id: "l5", name: "Office_Tower__L5.svg"},
	{id: "l6", name: "Office_Tower__L6.svg"},
	{id: "l7", name: "Office_Tower__L7.svg"},
	{id: "l8", name: "Office_Tower__L8.svg"},
	{id: "l9", name: "Office_Tower__L9.svg"},
	{id: "l10", name: "Office_Tower__L10.svg"},
	{id: "roof", name: "Office_Tower__Roof.svg"},
];

export function CanvasToolbarPage() {
	const [activeId, setActiveId] = useState("ground");
	const [activeIdLong, setActiveIdLong] = useState("ground");
	const [page, setPage] = useState(1);
	const [activeTool, setActiveTool] = useState<DrawingToolId>("select");
	const [shapeKind, setShapeKind] = useState<ShapeKind>("rectangle");
	const [lineKind, setLineKind] = useState<LineKind>("line");
	const [pinKind, setPinKind] = useState<PinKind>("pin");
	const [zoomLevel, setZoomLevel] = useState(1);

	const drawingActions = {
		activeTool,
		onActiveToolChange: setActiveTool,
		shapeKind,
		onShapeKindChange: setShapeKind,
		lineKind,
		onLineKindChange: setLineKind,
		pinKind,
		onPinKindChange: setPinKind,
	};

	const zoomTools = {
		zoomLevel,
		minZoom: 0.25,
		maxZoom: 4,
		onZoomIn: () => setZoomLevel((z) => Math.min(4, z + 0.25)),
		onZoomOut: () => setZoomLevel((z) => Math.max(0.25, z - 0.25)),
		onFit: () => setZoomLevel(1),
	};

	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Canvas Toolbar</h1>
					<CopyButton
						value="Canvas Toolbar"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Three-section canvas toolbar that pairs a blueprint picker on the left with{" "}
					<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">DrawingActions</code> in the middle and{" "}
					<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">ZoomTools</code> on the right. The blueprint
					picker can be a <code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">Select</code> or a searchable
					<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs"> Combobox</code>; an optional pager appears
					when the active blueprint has multiple pages.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Default — Select</CardTitle>
						<CopyButton
							value="Canvas Toolbar - Default"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Uses the standard Select dropdown for the blueprint picker. No pager.</CardDescription>
				</CardHeader>
				<CardContent>
					<CanvasToolbar
						blueprints={sampleBlueprints}
						activeBlueprintId={activeId}
						onBlueprintChange={setActiveId}
						drawingActions={drawingActions}
						zoomTools={zoomTools}
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>With page nav</CardTitle>
						<CopyButton
							value="Canvas Toolbar - With page nav"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Pager (prev / current / next) appears next to the picker when{" "}
						<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">pageCount &gt; 1</code>.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<CanvasToolbar
						blueprints={sampleBlueprints}
						activeBlueprintId={activeId}
						onBlueprintChange={setActiveId}
						pageIndex={page}
						pageCount={3}
						onPageChange={setPage}
						drawingActions={drawingActions}
						zoomTools={zoomTools}
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Searchable picker (Combobox)</CardTitle>
						<CopyButton
							value="Canvas Toolbar - Searchable picker"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Set <code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">searchableBlueprints</code> when the
						list grows past ~10 entries.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<CanvasToolbar
						blueprints={longBlueprintList}
						activeBlueprintId={activeIdLong}
						onBlueprintChange={setActiveIdLong}
						searchableBlueprints
						drawingActions={drawingActions}
						zoomTools={zoomTools}
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Selector only</CardTitle>
						<CopyButton
							value="Canvas Toolbar - Selector only"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Pass <code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">drawingActions={"{null}"}</code> and{" "}
						<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">zoomTools={"{null}"}</code> to hide the
						middle and right sections — useful in read-only viewers.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<CanvasToolbar
						blueprints={sampleBlueprints}
						activeBlueprintId={activeId}
						onBlueprintChange={setActiveId}
						drawingActions={null}
						zoomTools={null}
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Canvas Toolbar - API Reference"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<div className="wwc:overflow-x-auto">
						<table className="wwc:w-full wwc:text-[13px]">
							<thead>
								<tr className="wwc:border-b wwc:border-border">
									<th className="wwc:py-3 wwc:pr-4 wwc:text-left wwc:font-semibold wwc:text-foreground">Prop</th>
									<th className="wwc:py-3 wwc:pr-4 wwc:text-left wwc:font-semibold wwc:text-foreground">Type</th>
									<th className="wwc:py-3 wwc:pr-4 wwc:text-left wwc:font-semibold wwc:text-foreground">Default</th>
									<th className="wwc:py-3 wwc:text-left wwc:font-semibold wwc:text-foreground">Description</th>
								</tr>
							</thead>
							<tbody>
								{[
									{
										prop: "blueprints",
										type: "CanvasToolbarBlueprint[]",
										def: "—",
										desc: "Array of {id, name, disabled?} entries shown in the picker.",
									},
									{
										prop: "activeBlueprintId",
										type: "string",
										def: "—",
										desc: "Currently selected blueprint id.",
									},
									{
										prop: "onBlueprintChange",
										type: "(id) => void",
										def: "—",
										desc: "Fires when the picker selects a blueprint.",
									},
									{
										prop: "searchableBlueprints",
										type: "boolean",
										def: "false",
										desc: "Render Combobox instead of Select. Use when the list exceeds ~10 entries.",
									},
									{
										prop: "pageIndex",
										type: "number",
										def: "—",
										desc: "1-based current page. Pager appears only when pageCount > 1.",
									},
									{prop: "pageCount", type: "number", def: "—", desc: "Total pages in the active blueprint."},
									{prop: "onPageChange", type: "(next) => void", def: "—", desc: "Fires when prev/next clicked."},
									{
										prop: "drawingActions",
										type: "DrawingActionsProps | null",
										def: "—",
										desc: "Forwarded to DrawingActions. Pass null to hide the middle section.",
									},
									{
										prop: "zoomTools",
										type: "ZoomToolsProps | null",
										def: "—",
										desc: "Forwarded to ZoomTools. Pass null to hide the right section.",
									},
								].map((row) => (
									<tr key={row.prop} className="wwc:border-b wwc:border-border wwc:last:border-b-0">
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:font-medium wwc:text-primary wwc:whitespace-nowrap">
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
