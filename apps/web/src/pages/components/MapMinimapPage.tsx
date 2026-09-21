import {useState} from "react";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {MapMinimap} from "@/components/ui/map-minimap";

// A whole "map" scene — grid, roads, and buildings — used both full-size and as the minimap thumbnail.
function Scene() {
	return (
		<div className="wwc:absolute wwc:inset-0 wwc:h-full wwc:w-full">
			<div className="wwc:absolute wwc:inset-0 wwc:bg-gradient-to-br wwc:from-emerald-100 wwc:via-sky-100 wwc:to-amber-100" />
			<svg className="wwc:absolute wwc:inset-0 wwc:h-full wwc:w-full wwc:text-slate-500/40" aria-hidden="true">
				<defs>
					<pattern id="mm-grid" width="40" height="40" patternUnits="userSpaceOnUse">
						<path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
					</pattern>
				</defs>
				<rect width="100%" height="100%" fill="url(#mm-grid)" />
				<path d="M0 300 Q 240 220 460 320 T 920 280" fill="none" stroke="currentColor" strokeWidth="7" />
				<path d="M160 0 L 230 448" fill="none" stroke="currentColor" strokeWidth="5" />
				<path d="M520 0 L 560 448" fill="none" stroke="currentColor" strokeWidth="4" />
				<path d="M0 120 L 920 90" fill="none" stroke="currentColor" strokeWidth="4" />
				<rect x="60" y="150" width="70" height="60" rx="4" fill="currentColor" opacity="0.35" />
				<rect x="300" y="150" width="150" height="110" rx="6" fill="currentColor" opacity="0.45" />
				<rect x="620" y="320" width="110" height="70" rx="4" fill="currentColor" opacity="0.35" />
				<rect x="740" y="150" width="90" height="80" rx="4" fill="currentColor" opacity="0.35" />
			</svg>
		</div>
	);
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export function MapMinimapPage() {
	const [zoom, setZoom] = useState(2.5);
	const [center, setCenter] = useState({x: 0.5, y: 0.5});

	const size = 1 / zoom;
	const half = size / 2;
	const cx = clamp(center.x, half, 1 - half);
	const cy = clamp(center.y, half, 1 - half);
	const viewport = {x: cx - half, y: cy - half, width: size, height: size};

	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Map Minimap</h1>
					<CopyButton
						value="Map Minimap"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2 wwc:max-w-2xl">
					An overview thumbnail of the whole map with a box marking the region the main view is showing. Feed it the
					current <code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">viewport</code> (fractions of the full
					map); with <code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">onNavigate</code>, dragging or
					clicking the minimap recenters the view. Pairs with{" "}
					<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">CompareView</code>'s{" "}
					<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">onViewChange</code> /{" "}
					<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">viewControllerRef</code>.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Overview &amp; navigation</CardTitle>
						<CopyButton
							value="Map Minimap - Overview"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Drag the box in the minimap (bottom-right) to move the main view, or use the zoom slider to change how much
						is shown.
					</CardDescription>
				</CardHeader>
				<CardContent className="wwc:space-y-3">
					<div className="wwc:flex wwc:items-center wwc:gap-3">
						<span className="wwc:text-sm wwc:text-muted-foreground">Zoom</span>
						<input
							type="range"
							min={1.5}
							max={5}
							step={0.1}
							value={zoom}
							onChange={(e) => setZoom(Number(e.target.value))}
							className="wwc:w-48"
						/>
						<span className="wwc:font-mono wwc:text-xs wwc:text-muted-foreground">
							{zoom.toFixed(1)}x · view {Math.round(size * 100)}%
						</span>
					</div>
					<div className="wwc:relative wwc:h-80 wwc:overflow-hidden wwc:rounded-lg wwc:border">
						<div
							className="wwc:absolute wwc:inset-0"
							style={{
								transform: `scale(${zoom}) translate(${-viewport.x * 100}%, ${-viewport.y * 100}%)`,
								transformOrigin: "0 0",
							}}
						>
							<Scene />
						</div>
						<MapMinimap
							className="wwc:absolute wwc:bottom-3 wwc:right-3 wwc:z-10"
							viewport={viewport}
							onNavigate={setCenter}
							label="Overview"
							minimizable
						>
							<Scene />
						</MapMinimap>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Map Minimap - API Reference"
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
									<th className="wwc:py-3 wwc:text-left wwc:font-semibold wwc:text-foreground">Description</th>
								</tr>
							</thead>
							<tbody>
								{[
									{prop: "children", type: "ReactNode", desc: "The whole-map thumbnail (fills the minimap)."},
									{
										prop: "viewport",
										type: "{x, y, width, height}",
										desc: "The visible region as fractions (0–1) of the full map.",
									},
									{
										prop: "onNavigate",
										type: "(center: {x, y}) => void",
										desc: "Drag/click to recenter; called with the new center (0–1).",
									},
									{
										prop: "label",
										type: "ReactNode",
										desc: "Header label above the preview (and on the collapsed chip).",
									},
									{
										prop: "minimizable",
										type: "boolean",
										desc: "Add a minimize control; collapses to a compact reopen chip (like the Legend).",
									},
								].map((row) => (
									<tr key={row.prop} className="wwc:border-b wwc:border-border wwc:last:border-b-0">
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:font-medium wwc:text-primary wwc:whitespace-nowrap">
											{row.prop}
										</td>
										<td className="wwc:py-3 wwc:pr-4 wwc:font-mono wwc:text-muted-foreground">{row.type}</td>
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
