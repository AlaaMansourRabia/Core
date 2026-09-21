import {useState} from "react";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {
	DrawingActions,
	type DrawingToolId,
	type LineKind,
	type PinKind,
	type ShapeKind,
} from "@/components/ui/drawing-actions";

export function DrawingActionsPage() {
	const [activeTool, setActiveTool] = useState<DrawingToolId>("select");
	const [shapeKind, setShapeKind] = useState<ShapeKind>("rectangle");
	const [lineKind, setLineKind] = useState<LineKind>("line");
	const [pinKind, setPinKind] = useState<PinKind>("pin");
	const [history, setHistory] = useState<string[]>([]);

	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Drawing Actions</h1>
					<CopyButton
						value="Drawing Actions"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Drawing toolbar for the canvas: Select / Shape / Line / Pin tool groups + Undo / Redo. Tools with sub-tools
					open a <code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">DropdownMenu</code>; selecting a
					sub-tool activates its parent group and remembers the choice for later activation.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Default</CardTitle>
						<CopyButton
							value="Drawing Actions - Default"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Uncontrolled — defaults to the Select tool with Rectangle / Line / Pin marker as the remembered sub-tools.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<DrawingActions />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Controlled</CardTitle>
						<CopyButton
							value="Drawing Actions - Controlled"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Drive every piece of state from outside. Switching to a sub-tool activates its parent group automatically.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:flex wwc:flex-col wwc:gap-4">
						<DrawingActions
							activeTool={activeTool}
							onActiveToolChange={setActiveTool}
							shapeKind={shapeKind}
							onShapeKindChange={setShapeKind}
							lineKind={lineKind}
							onLineKindChange={setLineKind}
							pinKind={pinKind}
							onPinKindChange={setPinKind}
							onUndo={() => setHistory((prev) => [...prev, "undo"])}
							onRedo={() => setHistory((prev) => [...prev, "redo"])}
						/>
						<div className="wwc:rounded-md wwc:border wwc:bg-muted/30 wwc:p-3 wwc:font-mono wwc:text-xs wwc:text-muted-foreground">
							<div>activeTool: {JSON.stringify(activeTool)}</div>
							<div>shapeKind: {JSON.stringify(shapeKind)}</div>
							<div>lineKind: {JSON.stringify(lineKind)}</div>
							<div>pinKind: {JSON.stringify(pinKind)}</div>
							<div>history: [{history.slice(-5).join(", ")}]</div>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Disabled history</CardTitle>
						<CopyButton
							value="Drawing Actions - Disabled history"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Pass <code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">canUndo</code> /{" "}
						<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">canRedo</code> to gate the history buttons.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<DrawingActions canUndo={false} canRedo={false} />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Drawing Actions - API Reference"
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
										prop: "activeTool",
										type: '"select" | "shape" | "line" | "pin"',
										def: '"select"',
										desc: "Currently active drawing tool.",
									},
									{
										prop: "onActiveToolChange",
										type: "(tool) => void",
										def: "—",
										desc: "Fires when the active tool changes.",
									},
									{
										prop: "shapeKind",
										type: '"rectangle" | "ellipse" | "polygon"',
										def: '"rectangle"',
										desc: "Selected sub-tool inside the Shape group.",
									},
									{
										prop: "onShapeKindChange",
										type: "(kind) => void",
										def: "—",
										desc: "Fires when a Shape sub-tool is picked.",
									},
									{
										prop: "lineKind",
										type: '"line" | "polyline"',
										def: '"line"',
										desc: "Selected sub-tool inside the Line group.",
									},
									{
										prop: "onLineKindChange",
										type: "(kind) => void",
										def: "—",
										desc: "Fires when a Line sub-tool is picked.",
									},
									{
										prop: "pinKind",
										type: '"pin" | "reference"',
										def: '"pin"',
										desc: "Selected sub-tool inside the Pin group.",
									},
									{
										prop: "onPinKindChange",
										type: "(kind) => void",
										def: "—",
										desc: "Fires when a Pin sub-tool is picked.",
									},
									{prop: "onUndo", type: "() => void", def: "—", desc: "Fires when the Undo button is clicked."},
									{prop: "onRedo", type: "() => void", def: "—", desc: "Fires when the Redo button is clicked."},
									{prop: "canUndo", type: "boolean", def: "true", desc: "Disables the Undo button when false."},
									{prop: "canRedo", type: "boolean", def: "true", desc: "Disables the Redo button when false."},
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
