import {Hand, MousePointer2, Redo2, Ruler, Undo2, ZoomIn, ZoomOut} from "lucide-react";
import {useState} from "react";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {Toolbar, ToolbarButton, ToolbarGroup, ToolbarSeparator} from "@/components/ui/toolbar";

export function ToolbarPage() {
	const [activeTool, setActiveTool] = useState<"select" | "hand">("select");

	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Toolbar</h1>
					<CopyButton
						value="Toolbar"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Low-level toolbar primitives for building canvas and editor chrome:{" "}
					<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">Toolbar</code>,{" "}
					<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">ToolbarButton</code>,{" "}
					<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">ToolbarSeparator</code>, and{" "}
					<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">ToolbarGroup</code>. Compose them to assemble
					higher-level toolbars.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Basic</CardTitle>
						<CopyButton
							value="Toolbar - Basic"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Icon-only <code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">ToolbarButton</code>s, a{" "}
						<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">ToolbarSeparator</code>, and an icon+text
						button. Renders <code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">role="toolbar"</code>.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Toolbar>
						<ToolbarButton icon label="Undo">
							<Undo2 />
						</ToolbarButton>
						<ToolbarButton icon label="Redo">
							<Redo2 />
						</ToolbarButton>
						<ToolbarSeparator />
						<ToolbarButton icon label="Zoom in">
							<ZoomIn />
						</ToolbarButton>
						<ToolbarButton icon label="Zoom out">
							<ZoomOut />
						</ToolbarButton>
						<ToolbarSeparator />
						<ToolbarButton label="Scale">
							<Ruler />
							Scale
						</ToolbarButton>
					</Toolbar>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Active / pressed state</CardTitle>
						<CopyButton
							value="Toolbar - Active state"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Pass <code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">active</code> to show a pressed/muted
						state and set <code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">aria-pressed</code>. Toggle
						between the select and hand tools below.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:flex wwc:flex-col wwc:gap-4">
						<Toolbar>
							<ToolbarButton
								icon
								label="Select"
								active={activeTool === "select"}
								onClick={() => setActiveTool("select")}
							>
								<MousePointer2 />
							</ToolbarButton>
							<ToolbarButton icon label="Pan" active={activeTool === "hand"} onClick={() => setActiveTool("hand")}>
								<Hand />
							</ToolbarButton>
						</Toolbar>
						<div className="wwc:rounded-md wwc:border wwc:bg-muted/30 wwc:p-3 wwc:font-mono wwc:text-xs wwc:text-muted-foreground">
							activeTool: {activeTool}
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Groups + full width</CardTitle>
						<CopyButton
							value="Toolbar - Groups full width"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						With <code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">fullWidth</code>, the toolbar spans its
						container. <code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">ToolbarGroup</code> with{" "}
						<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">grow</code> and{" "}
						<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">align</code> distributes items into left /
						center / right clusters.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Toolbar fullWidth>
						<ToolbarGroup align="start">
							<ToolbarButton icon label="Undo">
								<Undo2 />
							</ToolbarButton>
							<ToolbarButton icon label="Redo">
								<Redo2 />
							</ToolbarButton>
						</ToolbarGroup>
						<ToolbarGroup align="center" grow>
							<ToolbarButton label="Scale">
								<Ruler />
								Scale
							</ToolbarButton>
						</ToolbarGroup>
						<ToolbarGroup align="end">
							<ToolbarButton icon label="Zoom out">
								<ZoomOut />
							</ToolbarButton>
							<ToolbarButton icon label="Zoom in">
								<ZoomIn />
							</ToolbarButton>
						</ToolbarGroup>
					</Toolbar>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Bare variant (nested)</CardTitle>
						<CopyButton
							value="Toolbar - Bare variant"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">variant="bare"</code> drops the border and
						background so the toolbar can sit transparently inside another surface.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:rounded-lg wwc:border wwc:bg-muted/30 wwc:p-3">
						<Toolbar variant="bare">
							<ToolbarButton icon label="Select">
								<MousePointer2 />
							</ToolbarButton>
							<ToolbarButton icon label="Pan">
								<Hand />
							</ToolbarButton>
							<ToolbarSeparator />
							<ToolbarButton label="Scale">
								<Ruler />
								Scale
							</ToolbarButton>
						</Toolbar>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Toolbar - API Reference"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
				</CardHeader>
				<CardContent>
					<div className="wwc:overflow-x-auto">
						<table className="wwc:w-full wwc:text-[13px]">
							<thead>
								<tr className="wwc:border-b wwc:border-border">
									<th className="wwc:py-3 wwc:pr-4 wwc:text-left wwc:font-semibold wwc:text-foreground">Component</th>
									<th className="wwc:py-3 wwc:pr-4 wwc:text-left wwc:font-semibold wwc:text-foreground">Prop</th>
									<th className="wwc:py-3 wwc:pr-4 wwc:text-left wwc:font-semibold wwc:text-foreground">Type</th>
									<th className="wwc:py-3 wwc:pr-4 wwc:text-left wwc:font-semibold wwc:text-foreground">Default</th>
									<th className="wwc:py-3 wwc:text-left wwc:font-semibold wwc:text-foreground">Description</th>
								</tr>
							</thead>
							<tbody>
								{[
									{
										comp: "Toolbar",
										prop: "variant",
										type: '"default" | "bare"',
										def: '"default"',
										desc: "bare drops the border/background for nesting inside another surface.",
									},
									{
										comp: "Toolbar",
										prop: "fullWidth",
										type: "boolean",
										def: "false",
										desc: "Span the container width instead of hugging content.",
									},
									{
										comp: "ToolbarButton",
										prop: "icon",
										type: "boolean",
										def: "false",
										desc: "Render an icon-only button (square hit area).",
									},
									{
										comp: "ToolbarButton",
										prop: "label",
										type: "string",
										def: "—",
										desc: "Accessible label / tooltip text.",
									},
									{
										comp: "ToolbarButton",
										prop: "shortcut",
										type: "string",
										def: "—",
										desc: "Keyboard shortcut hint shown alongside the label.",
									},
									{
										comp: "ToolbarButton",
										prop: "active",
										type: "boolean",
										def: "false",
										desc: "Pressed/muted state; sets aria-pressed.",
									},
									{
										comp: "ToolbarGroup",
										prop: "align",
										type: '"start" | "center" | "end"',
										def: '"start"',
										desc: "Horizontal alignment of grouped items.",
									},
									{
										comp: "ToolbarGroup",
										prop: "grow",
										type: "boolean",
										def: "false",
										desc: "Let the group flex-grow to fill available space.",
									},
									{
										comp: "ToolbarSeparator",
										prop: "—",
										type: "—",
										def: "—",
										desc: "Vertical divider between toolbar items.",
									},
								].map((row) => (
									<tr key={`${row.comp}-${row.prop}`} className="wwc:border-b wwc:border-border wwc:last:border-b-0">
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-muted-foreground wwc:whitespace-nowrap">
											{row.comp}
										</td>
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
