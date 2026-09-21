import {Circle, Copy, Download, Hexagon, MoreHorizontal, Share2, Slash, Spline, Square, Trash2} from "lucide-react";
import {useState} from "react";

import {CopyButton} from "@/components/ui/copy-button";
import {Toolbar, ToolbarMenuButton, type ToolbarMenuOption, ToolbarSeparator} from "@/components/ui/toolbar";

type ShapeId = "rectangle" | "ellipse" | "polygon";

const SHAPE_OPTIONS: ToolbarMenuOption<ShapeId>[] = [
	{id: "rectangle", label: "Rectangle", icon: <Square className="wwc:h-4 wwc:w-4" />, shortcut: "R"},
	{id: "ellipse", label: "Ellipse", icon: <Circle className="wwc:h-4 wwc:w-4" />, shortcut: "E"},
	{id: "polygon", label: "Polygon", icon: <Hexagon className="wwc:h-4 wwc:w-4" />, shortcut: "Y"},
];

const LINE_OPTIONS: ToolbarMenuOption[] = [
	{id: "line", label: "Line", icon: <Slash className="wwc:h-4 wwc:w-4" />, shortcut: "L"},
	{id: "polyline", label: "Polyline", icon: <Spline className="wwc:h-4 wwc:w-4" />, shortcut: "Shift+L"},
];

const ACTION_OPTIONS: ToolbarMenuOption[] = [
	{id: "duplicate", label: "Duplicate", icon: <Copy className="wwc:h-4 wwc:w-4" />, shortcut: "⌘D"},
	{id: "export", label: "Export", icon: <Download className="wwc:h-4 wwc:w-4" />},
	{id: "share", label: "Share", icon: <Share2 className="wwc:h-4 wwc:w-4" />},
	{id: "delete", label: "Delete", icon: <Trash2 className="wwc:h-4 wwc:w-4" />, disabled: true},
];

export function ToolbarMenuButtonPage() {
	const [shape, setShape] = useState<ShapeId>("rectangle");
	const [line, setLine] = useState("line");
	const [lastAction, setLastAction] = useState("—");

	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Toolbar Menu Button</h1>
					<CopyButton
						value="Toolbar Menu Button"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:mt-2 wwc:max-w-2xl wwc:text-muted-foreground">
					A toolbar button that opens a dropdown of options. Generic and reusable: drive it with a{" "}
					<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:py-0.5 wwc:text-sm">value</code> to use it as a
					single-select picker (the selected option's icon shows on the trigger), or omit{" "}
					<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:py-0.5 wwc:text-sm">value</code> and pass a{" "}
					<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:py-0.5 wwc:text-sm">triggerIcon</code> to use it as a
					plain action menu. Extracted from the shape / line / pin pickers in{" "}
					<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:py-0.5 wwc:text-sm">DrawingActions</code>.
				</p>
			</div>

			{/* Single-select picker */}
			<section className="wwc:space-y-3 wwc:rounded-lg wwc:border wwc:p-6">
				<div>
					<h2 className="wwc:font-semibold">Single-select picker</h2>
					<p className="wwc:text-sm wwc:text-muted-foreground">
						Pass <code className="wwc:text-xs">value</code> and <code className="wwc:text-xs">onSelect</code>. The
						trigger shows the selected option's icon; the active row is highlighted.
					</p>
				</div>
				<Toolbar>
					<ToolbarMenuButton options={SHAPE_OPTIONS} value={shape} onSelect={setShape} label="Shape tool" active />
					<ToolbarSeparator />
					<ToolbarMenuButton options={LINE_OPTIONS} value={line} onSelect={setLine} label="Line tool" />
				</Toolbar>
				<p className="wwc:font-mono wwc:text-xs wwc:text-muted-foreground">
					shape: {shape} · line: {line}
				</p>
			</section>

			{/* Action menu */}
			<section className="wwc:space-y-3 wwc:rounded-lg wwc:border wwc:p-6">
				<div>
					<h2 className="wwc:font-semibold">Action menu</h2>
					<p className="wwc:text-sm wwc:text-muted-foreground">
						Omit <code className="wwc:text-xs">value</code> and pass a <code className="wwc:text-xs">triggerIcon</code>{" "}
						for an overflow / "more actions" menu. Options can be <code className="wwc:text-xs">disabled</code>.
					</p>
				</div>
				<Toolbar>
					<ToolbarMenuButton
						options={ACTION_OPTIONS}
						onSelect={setLastAction}
						label="More actions"
						triggerIcon={<MoreHorizontal className="wwc:h-4 wwc:w-4" />}
						align="end"
					/>
				</Toolbar>
				<p className="wwc:font-mono wwc:text-xs wwc:text-muted-foreground">last action: {lastAction}</p>
			</section>
		</div>
	);
}
