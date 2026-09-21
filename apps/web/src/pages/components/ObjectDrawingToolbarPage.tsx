import {useState} from "react";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {type DrawingTool, ObjectDrawingToolbar} from "@/components/ui/object-drawing-toolbar";

export function ObjectDrawingToolbarPage() {
	const [tool, setTool] = useState<DrawingTool>("select");
	const [editing, setEditing] = useState(true);
	const [opacity, setOpacity] = useState(80);
	const [fill, setFill] = useState("#2563EB");
	const [stroke, setStroke] = useState("#7C3AED");
	const [snap, setSnap] = useState(false);

	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Object Drawing Toolbar</h1>
					<CopyButton
						value="Object Drawing Toolbar"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2 wwc:max-w-2xl">
					A single-line horizontal toolbar for a 2D canvas drawing tool, with divider-separated groups: a mode toggle, a
					drawing-tool group (select, line, circle, rectangle, polygon), fill/stroke color pickers, an opacity slider, a
					90° snap toggle, and unlink / import actions. Composed entirely from WakeCore components.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Toolbar</CardTitle>
						<CopyButton
							value="Object Drawing Toolbar - Toolbar"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Toggle mode, pick a tool, set fill/stroke colors, drag opacity, and flip the 90° snap.
					</CardDescription>
				</CardHeader>
				<CardContent className="wwc:space-y-4">
					<div className="wwc:overflow-x-auto wwc:pb-1">
						<ObjectDrawingToolbar
							defaultEditing={editing}
							onEditingChange={setEditing}
							defaultTool={tool}
							onToolChange={setTool}
							defaultFillColor={fill}
							onFillColorChange={setFill}
							defaultStrokeColor={stroke}
							onStrokeColorChange={setStroke}
							defaultOpacity={opacity}
							onOpacityChange={setOpacity}
							defaultAngleSnap={snap}
							onAngleSnapChange={setSnap}
						/>
					</div>
					<p className="wwc:font-mono wwc:text-xs wwc:text-muted-foreground">
						mode: {editing ? "editing" : "viewing"} · tool: {tool} · opacity: {opacity}% · fill: {fill} · stroke:{" "}
						{stroke} · 90°: {snap ? "on" : "off"}
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
