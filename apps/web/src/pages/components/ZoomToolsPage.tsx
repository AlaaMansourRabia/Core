import {useState} from "react";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {ZoomTools} from "@/components/ui/zoom-tools";

export function ZoomToolsPage() {
	const [zoomLevel, setZoomLevel] = useState(1);
	const [history, setHistory] = useState<string[]>([]);
	const log = (entry: string) => setHistory((prev) => [...prev, entry]);

	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Zoom Tools</h1>
					<CopyButton
						value="Zoom Tools"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Canvas zoom toolbar: Zoom Out / editable percentage / Zoom In / Fit to view, grouped in a single control.
					Pairs with <code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">DrawingActions</code> on the canvas
					top bar. Zoom buttons disable automatically at the configured min/max bounds.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Default</CardTitle>
						<CopyButton
							value="Zoom Tools - Default"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Uncontrolled — buttons stay enabled at the default zoom level. Wire callbacks to pan/zoom your canvas.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ZoomTools />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Controlled</CardTitle>
						<CopyButton
							value="Zoom Tools - Controlled"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Drive the zoom state from outside. Zoom In / Zoom Out auto-disable when the level hits the configured
						bounds.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:flex wwc:flex-col wwc:gap-4">
						<ZoomTools
							zoomLevel={zoomLevel}
							minZoom={0.25}
							maxZoom={4}
							onZoomIn={() => {
								setZoomLevel((prev) => Math.min(4, prev + 0.25));
								log("zoom in");
							}}
							onZoomOut={() => {
								setZoomLevel((prev) => Math.max(0.25, prev - 0.25));
								log("zoom out");
							}}
							onFit={() => {
								setZoomLevel(1);
								log("fit");
							}}
							onZoomChange={(z) => {
								setZoomLevel(z);
								log(`set ${Math.round(z * 100)}%`);
							}}
						/>
						<div className="wwc:rounded-md wwc:border wwc:bg-muted/30 wwc:p-3 wwc:font-mono wwc:text-xs wwc:text-muted-foreground">
							<div>zoomLevel: {zoomLevel.toFixed(2)}x</div>
							<div>history: [{history.slice(-5).join(", ")}]</div>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Custom label</CardTitle>
						<CopyButton
							value="Zoom Tools - Custom label"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Override <code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">fitLabel</code> to localise the
						fit-to-view button.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ZoomTools fitLabel="Fit to page" />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Zoom Tools - API Reference"
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
										prop: "zoomLevel",
										type: "number",
										def: "1",
										desc: "Current zoom multiplier. Used to derive disabled state for Zoom In / Out.",
									},
									{prop: "minZoom", type: "number", def: "0.1", desc: "Minimum zoom level."},
									{prop: "maxZoom", type: "number", def: "10", desc: "Maximum zoom level."},
									{prop: "fitLabel", type: "string", def: '"Fit"', desc: "Label rendered on the fit-to-view button."},
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
									{prop: "onFit", type: "() => void", def: "—", desc: "Fires when the Fit button is clicked."},
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
