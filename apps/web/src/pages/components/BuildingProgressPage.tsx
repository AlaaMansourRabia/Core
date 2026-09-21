import {useState} from "react";

import {type BuildingFloor, BuildingProgress} from "@/components/ui/building-progress";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";

// Floors ordered top → bottom (roof first, base last). The base is usually further along than the
// upper floors, since construction runs bottom-up.
const FLOORS: BuildingFloor[] = [
	{id: "rf", label: "RF", value: 81},
	{id: "uf", label: "UF", value: 31},
	{id: "ff", label: "FF", value: 61},
	{id: "gf", label: "GF", value: 41},
	{id: "sub", label: "SUB", value: 96},
];

export function BuildingProgressPage() {
	const [activeId, setActiveId] = useState("gf");

	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Building Progress</h1>
					<CopyButton
						value="Building Progress"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:mt-2 wwc:max-w-2xl wwc:text-muted-foreground">
					A building elevation progress stack — one row per floor (top → bottom) with a completion bar and percentage,
					tapering wider toward the base like a building silhouette. The active floor is highlighted. Built for the
					lowest level of the Blueprint Viewer hierarchy, where each floor of a level shows its own progress.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Interactive</CardTitle>
						<CopyButton
							value="Building Progress - Interactive"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Pass <code>onFloorSelect</code> to make the rows clickable. The <code>activeId</code> floor is highlighted
						with an accent border, tint and bolder label / percentage.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:max-w-sm">
						<BuildingProgress floors={FLOORS} activeId={activeId} onFloorSelect={setActiveId} />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Static</CardTitle>
					<CardDescription>Without an active floor and non-interactive — a read-only progress summary.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:max-w-sm">
						<BuildingProgress floors={FLOORS} />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Compact</CardTitle>
					<CardDescription>
						The <code>compact</code> size shrinks the rows, bars and text for dense panels.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:max-w-xs">
						<BuildingProgress floors={FLOORS} activeId="gf" size="compact" />
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
