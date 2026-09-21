import {Compass, Layers, Maximize} from "lucide-react";
import {useState} from "react";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {Toolbar, ToolbarButton, ToolbarSeparator} from "@/components/ui/toolbar";
import {VerticalZoomTools} from "@/components/ui/vertical-zoom-tools";

// A muted satellite-ish backdrop the floating controls sit over.
function MapCanvas({children}: {children: React.ReactNode}) {
	return (
		<div className="wwc:relative wwc:h-80 wwc:overflow-hidden wwc:rounded-lg wwc:border">
			<div className="wwc:absolute wwc:inset-0 wwc:bg-gradient-to-br wwc:from-emerald-100 wwc:via-sky-100 wwc:to-slate-200 dark:wwc:from-emerald-950 dark:wwc:via-sky-950 dark:wwc:to-slate-900" />
			<svg className="wwc:absolute wwc:inset-0 wwc:h-full wwc:w-full wwc:text-slate-400/40" aria-hidden="true">
				<defs>
					<pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
						<path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
					</pattern>
				</defs>
				<rect width="100%" height="100%" fill="url(#map-grid)" />
				<path d="M0 220 Q 200 160 380 240 T 760 200" fill="none" stroke="currentColor" strokeWidth="6" />
				<path d="M120 0 L 180 320" fill="none" stroke="currentColor" strokeWidth="4" />
			</svg>
			{children}
		</div>
	);
}

export function VerticalZoomToolsPage() {
	const [zoomLevel, setZoomLevel] = useState(1);

	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Vertical Zoom Tools</h1>
					<CopyButton
						value="Vertical Zoom Tools"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2 wwc:max-w-2xl">
					A compact vertical zoom control — Zoom In over Zoom Out — designed to float over a map or canvas. The vertical
					counterpart to <code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">ZoomTools</code>, built on the
					orientation-aware <code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">Toolbar</code> primitive so
					it can be the first section of a larger vertical floating toolbar. Buttons disable at the min/max bounds.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Floating over a map</CardTitle>
						<CopyButton
							value="Vertical Zoom Tools - Floating over a map"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Position it absolutely over the map surface. Here it's controlled — Zoom In / Out auto-disable at the
						configured bounds.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<MapCanvas>
						<div className="wwc:absolute wwc:right-3 wwc:top-3">
							<VerticalZoomTools
								zoomLevel={zoomLevel}
								minZoom={0.5}
								maxZoom={4}
								onZoomIn={() => setZoomLevel((prev) => Math.min(4, prev + 0.5))}
								onZoomOut={() => setZoomLevel((prev) => Math.max(0.5, prev - 0.5))}
							/>
						</div>
						<div className="wwc:absolute wwc:bottom-3 wwc:left-3 wwc:rounded-md wwc:bg-background/80 wwc:px-2 wwc:py-1 wwc:font-mono wwc:text-xs wwc:text-muted-foreground wwc:backdrop-blur">
							zoom: {zoomLevel.toFixed(1)}x
						</div>
					</MapCanvas>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>First part of a vertical toolbar</CardTitle>
						<CopyButton
							value="Vertical Zoom Tools - Vertical toolbar"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Pass <code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">variant="bare"</code> to nest it as the
						first section inside a single vertical{" "}
						<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">Toolbar</code>, with more tools stacked
						below. (The extra buttons are placeholders for future parts.)
					</CardDescription>
				</CardHeader>
				<CardContent>
					<MapCanvas>
						<div className="wwc:absolute wwc:right-3 wwc:top-3">
							<Toolbar orientation="vertical">
								<VerticalZoomTools variant="bare" />
								<ToolbarSeparator orientation="horizontal" className="wwc:mx-0 wwc:w-full" />
								<ToolbarButton icon label="Reset bearing">
									<Compass className="wwc:h-4 wwc:w-4" />
								</ToolbarButton>
								<ToolbarButton icon label="Layers">
									<Layers className="wwc:h-4 wwc:w-4" />
								</ToolbarButton>
								<ToolbarButton icon label="Fit to view">
									<Maximize className="wwc:h-4 wwc:w-4" />
								</ToolbarButton>
							</Toolbar>
						</div>
					</MapCanvas>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Vertical Zoom Tools - API Reference"
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
										prop: "variant",
										type: '"default" | "bare"',
										def: '"default"',
										desc: "Draw the bordered floating surface, or drop it to nest inside a larger vertical toolbar.",
									},
									{
										prop: "zoomLevel",
										type: "number",
										def: "1",
										desc: "Current zoom multiplier. Used to derive disabled state for Zoom In / Out.",
									},
									{prop: "minZoom", type: "number", def: "0.1", desc: "Minimum zoom level."},
									{prop: "maxZoom", type: "number", def: "10", desc: "Maximum zoom level."},
									{
										prop: "canZoomIn",
										type: "boolean",
										def: "—",
										desc: "Override the auto-derived zoom-in enabled state.",
									},
									{
										prop: "canZoomOut",
										type: "boolean",
										def: "—",
										desc: "Override the auto-derived zoom-out enabled state.",
									},
									{prop: "onZoomIn", type: "() => void", def: "—", desc: "Fires when the Zoom In button is clicked."},
									{prop: "onZoomOut", type: "() => void", def: "—", desc: "Fires when the Zoom Out button is clicked."},
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
