import {useState} from "react";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CompareView} from "@/components/ui/compare-view";
import {CopyButton} from "@/components/ui/copy-button";
import {MapCompass} from "@/components/ui/map-compass";
import {MapToolbar, MapViewNav, type SplitMode} from "@/components/ui/map-toolbar";

// Faux "views" the bottom-center pager steps through — a path, a set of layers, or sheets.
const MAP_VIEWS = ["Ground floor", "Level 2", "Level 3", "Roof"];

// Two faux "captures" of the same site so the compare has a visible difference: the "as-built"
// layer is warm-tinted and gains an extra structure the "as-planned" layer doesn't have.
function MapLayer({variant}: {variant: "planned" | "built"}) {
	const built = variant === "built";
	return (
		<div className="wwc:absolute wwc:inset-0 wwc:h-full wwc:w-full">
			<div
				className={
					built
						? "wwc:absolute wwc:inset-0 wwc:bg-gradient-to-br wwc:from-amber-100 wwc:via-orange-100 wwc:to-rose-200 dark:wwc:from-amber-950 dark:wwc:via-orange-950 dark:wwc:to-rose-950"
						: "wwc:absolute wwc:inset-0 wwc:bg-gradient-to-br wwc:from-emerald-100 wwc:via-sky-100 wwc:to-slate-200 dark:wwc:from-emerald-950 dark:wwc:via-sky-950 dark:wwc:to-slate-900"
				}
			/>
			<svg className="wwc:absolute wwc:inset-0 wwc:h-full wwc:w-full wwc:text-slate-500/40" aria-hidden="true">
				<defs>
					<pattern id={`grid-${variant}`} width="40" height="40" patternUnits="userSpaceOnUse">
						<path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
					</pattern>
				</defs>
				<rect width="100%" height="100%" fill={`url(#grid-${variant})`} />
				{/* roads */}
				<path d="M0 300 Q 240 220 460 320 T 920 280" fill="none" stroke="currentColor" strokeWidth="7" />
				<path d="M160 0 L 230 448" fill="none" stroke="currentColor" strokeWidth="5" />
				<path d="M420 0 L 470 448" fill="none" stroke="currentColor" strokeWidth="4" />
				<path d="M0 120 L 920 90" fill="none" stroke="currentColor" strokeWidth="4" />
				{/* building blocks (shared) */}
				<rect x="60" y="150" width="70" height="60" rx="4" fill="currentColor" opacity="0.35" />
				<rect x="520" y="320" width="110" height="70" rx="4" fill="currentColor" opacity="0.35" />
				<rect x="700" y="150" width="90" height="80" rx="4" fill="currentColor" opacity="0.35" />
				{/* the one new structure that only exists in "as-built" */}
				{built && <rect x="300" y="150" width="150" height="110" rx="6" fill="currentColor" opacity="0.6" />}
			</svg>
		</div>
	);
}

export function MapToolbarPage() {
	const [splitMode, setSplitMode] = useState<SplitMode | null>(null);
	const [zoomLevel, setZoomLevel] = useState(1);
	const [bearing, setBearing] = useState(35);
	const [viewIndex, setViewIndex] = useState(0);
	const [lastAction, setLastAction] = useState("—");

	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Map Toolbar</h1>
					<CopyButton
						value="Map Toolbar"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2 wwc:max-w-2xl">
					A vertical floating toolbar for a map: a split-view control (hover it for the compare modes), a "my location"
					button, zoom (<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">VerticalZoomTools</code>), and a
					compass — each its own pill in the shared vertical-zoom-tools style. The compass is a separate pill below the
					zoom control. Every section is optional and appears only when its handler is wired up. Separate{" "}
					<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">MapViewNav</code> previous / next buttons
					float at the bottom-center to step between map views (a path, layers, or sheets).
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Floating over a map</CardTitle>
						<CopyButton
							value="Map Toolbar - Floating over a map"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Hover the split button to pick a compare mode, then drag the map to pan and scroll to zoom. In side-by-side,
						the lock on the divider syncs both panes (unlock to move them independently). The compass resets the bearing
						to north.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:relative wwc:h-[28rem] wwc:overflow-hidden wwc:rounded-lg wwc:border">
						{splitMode ? (
							<CompareView
								mode={splitMode}
								interactive
								defaultScale={1.5}
								before={<MapLayer variant="planned" />}
								after={<MapLayer variant="built" />}
								beforeLabel="As-planned"
								afterLabel="As-built"
							/>
						) : (
							<MapLayer variant="planned" />
						)}
						<div className="wwc:absolute wwc:right-3 wwc:top-3">
							<MapToolbar
								splitMode={splitMode}
								onSplitModeChange={(mode) => {
									setSplitMode(mode);
									setLastAction(`compare: ${mode}`);
								}}
								onLocate={() => setLastAction("locate")}
								zoomLevel={zoomLevel}
								minZoom={0.5}
								maxZoom={4}
								onZoomIn={() => {
									setZoomLevel((p) => Math.min(4, p + 0.5));
									setLastAction("zoom in");
								}}
								onZoomOut={() => {
									setZoomLevel((p) => Math.max(0.5, p - 0.5));
									setLastAction("zoom out");
								}}
								bearing={bearing}
								onResetNorth={() => {
									setBearing(0);
									setLastAction("reset north");
								}}
							/>
						</div>
						{/* Bottom-center pager for stepping between map views. */}
						<div className="wwc:absolute wwc:bottom-3 wwc:left-1/2 wwc:-translate-x-1/2">
							<MapViewNav
								canPrev={viewIndex > 0}
								canNext={viewIndex < MAP_VIEWS.length - 1}
								onPrev={() => {
									setViewIndex((i) => Math.max(0, i - 1));
									setLastAction("previous view");
								}}
								onNext={() => {
									setViewIndex((i) => Math.min(MAP_VIEWS.length - 1, i + 1));
									setLastAction("next view");
								}}
							/>
						</div>
						<div className="wwc:absolute wwc:left-3 wwc:top-3 wwc:space-y-1 wwc:rounded-md wwc:bg-background/80 wwc:px-2 wwc:py-1 wwc:font-mono wwc:text-xs wwc:text-muted-foreground wwc:backdrop-blur">
							<div>
								zoom: {zoomLevel.toFixed(1)}x · bearing: {bearing}°
							</div>
							<div>
								view: {MAP_VIEWS[viewIndex]} · compare: {splitMode ?? "off"} · last: {lastAction}
							</div>
						</div>
						{/* A control to spin the map bearing so the compass needle visibly rotates. */}
						<button
							type="button"
							onClick={() => setBearing((b) => (b + 30) % 360)}
							className="wwc:absolute wwc:bottom-3 wwc:right-3 wwc:rounded-md wwc:border wwc:bg-background/80 wwc:px-2 wwc:py-1 wwc:text-xs wwc:backdrop-blur wwc:hover:bg-accent"
						>
							Rotate map +30°
						</button>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Compass on its own</CardTitle>
						<CopyButton
							value="Map Toolbar - Compass"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">MapCompass</code> is a standalone control.
						The needle rotates with <code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">bearing</code> and
						pressing it fires <code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">onResetNorth</code>.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:flex wwc:items-center wwc:gap-6">
						<MapCompass bearing={bearing} onResetNorth={() => setBearing(0)} />
						<button
							type="button"
							onClick={() => setBearing((b) => (b + 30) % 360)}
							className="wwc:rounded-md wwc:border wwc:px-3 wwc:py-1.5 wwc:text-sm wwc:hover:bg-accent"
						>
							Rotate +30° (now {bearing}°)
						</button>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference — MapToolbar</CardTitle>
						<CopyButton
							value="Map Toolbar - API Reference"
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
									{
										prop: "splitMode",
										type: '"side-by-side" | "swipe" | null',
										desc: "Active compare mode (highlights the row + button).",
									},
									{
										prop: "onSplitModeChange",
										type: "(mode: SplitMode) => void",
										desc: "Renders the split control; called with the mode picked from its hover menu.",
									},
									{prop: "onLocate", type: "() => void", desc: 'Renders the "my location" button; called on press.'},
									{prop: "zoomLevel", type: "number", desc: "Current zoom multiplier for the embedded zoom control."},
									{prop: "minZoom / maxZoom", type: "number", desc: "Zoom bounds; buttons disable at the limits."},
									{
										prop: "onZoomIn / onZoomOut",
										type: "() => void",
										desc: "Renders the zoom control; fired on the respective button.",
									},
									{prop: "bearing", type: "number", desc: "Map bearing in degrees (0 = north) for the compass needle."},
									{
										prop: "onResetNorth",
										type: "() => void",
										desc: "Renders the compass pill (separate, below zoom); realigns to north on press.",
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
