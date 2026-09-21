import {useRef, useState} from "react";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CompareView, type CompareMode, type CompareViewApi} from "@/components/ui/compare-view";
import {CopyButton} from "@/components/ui/copy-button";
import {MapMinimap, type MapMinimapViewport} from "@/components/ui/map-minimap";

// Two geo-aligned "captures" of the same scene; the "after" gains a structure and a warmer tone.
function Scene({variant}: {variant: "before" | "after"}) {
	const after = variant === "after";
	return (
		<div className="wwc:absolute wwc:inset-0 wwc:h-full wwc:w-full">
			<div
				className={
					after
						? "wwc:absolute wwc:inset-0 wwc:bg-gradient-to-br wwc:from-amber-100 wwc:via-orange-100 wwc:to-rose-200"
						: "wwc:absolute wwc:inset-0 wwc:bg-gradient-to-br wwc:from-emerald-100 wwc:via-sky-100 wwc:to-slate-200"
				}
			/>
			<svg className="wwc:absolute wwc:inset-0 wwc:h-full wwc:w-full wwc:text-slate-500/40" aria-hidden="true">
				<defs>
					<pattern id={`cv-grid-${variant}`} width="40" height="40" patternUnits="userSpaceOnUse">
						<path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
					</pattern>
				</defs>
				<rect width="100%" height="100%" fill={`url(#cv-grid-${variant})`} />
				<path d="M0 240 Q 220 170 440 250 T 900 220" fill="none" stroke="currentColor" strokeWidth="7" />
				<path d="M150 0 L 210 360" fill="none" stroke="currentColor" strokeWidth="5" />
				<path d="M430 0 L 480 360" fill="none" stroke="currentColor" strokeWidth="4" />
				<rect x="60" y="120" width="70" height="60" rx="4" fill="currentColor" opacity="0.35" />
				<rect x="520" y="250" width="110" height="70" rx="4" fill="currentColor" opacity="0.35" />
				{after && <rect x="280" y="110" width="150" height="110" rx="6" fill="currentColor" opacity="0.6" />}
			</svg>
		</div>
	);
}

function Frame({children}: {children: React.ReactNode}) {
	return <div className="wwc:relative wwc:h-80 wwc:overflow-hidden wwc:rounded-lg wwc:border">{children}</div>;
}

export function CompareViewPage() {
	const [mode, setMode] = useState<CompareMode>("swipe");
	const [position, setPosition] = useState(50);
	const [view, setView] = useState<MapMinimapViewport>({x: 0, y: 0, width: 1, height: 1});
	const controller = useRef<CompareViewApi | null>(null);

	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Compare View</h1>
					<CopyButton
						value="Compare View"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2 wwc:max-w-2xl">
					Compares two geo-aligned sources (e.g. as-planned vs. as-built, or yesterday vs. today).{" "}
					<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">swipe</code> overlays them with a draggable
					reveal divider — drag the handle (or focus it and use ←/→) to flicker between views;{" "}
					<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">side-by-side</code> splits the box into two
					panes. With interactive, drag to pan and scroll to zoom; side-by-side gains a lock on the divider that syncs
					both panes to the same coordinates. Pass any nodes (images, maps, canvases) for{" "}
					<code className="wwc:text-xs">before</code>/<code className="wwc:text-xs">after</code>.
				</p>
			</div>

			{/* Interactive */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Modes</CardTitle>
						<CopyButton
							value="Compare View - Modes"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Switch modes and, in swipe mode, drag the divider across the scene.</CardDescription>
				</CardHeader>
				<CardContent className="wwc:space-y-3">
					<div className="wwc:flex wwc:items-center wwc:gap-2">
						{(["swipe", "side-by-side"] as const).map((m) => (
							<button
								key={m}
								type="button"
								onClick={() => setMode(m)}
								className={
									mode === m
										? "wwc:rounded-md wwc:border wwc:border-primary wwc:bg-primary wwc:px-3 wwc:py-1.5 wwc:text-sm wwc:text-primary-foreground"
										: "wwc:rounded-md wwc:border wwc:px-3 wwc:py-1.5 wwc:text-sm wwc:hover:bg-accent"
								}
							>
								{m}
							</button>
						))}
						<span className="wwc:ml-2 wwc:font-mono wwc:text-xs wwc:text-muted-foreground">
							{mode === "swipe" ? `position: ${Math.round(position)}%` : "two panes"}
						</span>
					</div>
					<Frame>
						<CompareView
							mode={mode}
							interactive
							defaultScale={1.5}
							position={mode === "swipe" ? position : undefined}
							onPositionChange={setPosition}
							onViewChange={setView}
							viewControllerRef={controller}
							before={<Scene variant="before" />}
							after={<Scene variant="after" />}
							beforeLabel="As-planned"
							afterLabel="As-built"
						/>
						<MapMinimap
							className="wwc:absolute wwc:bottom-3 wwc:right-3 wwc:z-20 wwc:h-24 wwc:w-36"
							viewport={view}
							onNavigate={(c) => controller.current?.setCenter(c.x, c.y)}
							label="Overview"
						>
							<Scene variant="after" />
						</MapMinimap>
					</Frame>
				</CardContent>
			</Card>

			{/* API */}
			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>API Reference</CardTitle>
						<CopyButton
							value="Compare View - API Reference"
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
									{prop: "before / after", type: "ReactNode", desc: "The two geo-aligned sources to compare."},
									{prop: "mode", type: '"swipe" | "side-by-side"', desc: "Reveal divider (default) or two panes."},
									{prop: "position", type: "number", desc: "Divider position 0–100 (swipe); controlled when set."},
									{prop: "defaultPosition", type: "number", desc: "Uncontrolled starting position. Default 50."},
									{
										prop: "onPositionChange",
										type: "(position: number) => void",
										desc: "Fires while dragging the divider.",
									},
									{prop: "beforeLabel / afterLabel", type: "ReactNode", desc: "Optional corner chip labels."},
									{prop: "interactive", type: "boolean", desc: "Enable pan (drag) and zoom (wheel) of the content."},
									{prop: "defaultScale", type: "number", desc: "Initial zoom when interactive. Default 1."},
									{prop: "minScale / maxScale", type: "number", desc: "Zoom bounds. Default 1 → 6."},
									{
										prop: "locked / onLockedChange",
										type: "boolean",
										desc: "Side-by-side: sync both panes' pan/zoom. Default locked; the divider lock toggles it.",
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
