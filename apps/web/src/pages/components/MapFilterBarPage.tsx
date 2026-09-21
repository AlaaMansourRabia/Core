import {useState} from "react";

import {type FilterChip, MapFilterBar} from "@/components/map-filter-bar";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";

const FILTERS: FilterChip[] = [
	{id: "bedrooms", label: "2+ bedrooms"},
	{id: "washer", label: "Washer"},
	{id: "kitchen", label: "Kitchen"},
	{id: "wifi", label: "Wifi"},
	{id: "ac", label: "Air conditioning"},
	{id: "free-cancellation", label: "Free cancellation"},
	{id: "free-parking", label: "Free parking"},
	{id: "self-checkin", label: "Self check-in"},
	{id: "tv", label: "TV"},
	{id: "guest-favorite", label: "Guest favorite"},
];

export function MapFilterBarPage() {
	const [selected, setSelected] = useState<string[]>(["bedrooms"]);

	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Map Filter Bar</h1>
					<CopyButton
						value="Map Filter Bar"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:mt-2 wwc:max-w-2xl wwc:text-muted-foreground">
					A horizontal, Airbnb-style filter bar for a map: a leading <strong>Filters</strong> button with an
					active-count badge, a divider, and a horizontally scrollable row of toggleable filter chips. Composed from
					stock WakeCore components — <code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">Button</code>,{" "}
					<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">Badge</code>,{" "}
					<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">ToolbarSeparator</code>, and{" "}
					<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">Chip</code> — used as-is.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Filter bar</CardTitle>
						<CopyButton
							value="Map Filter Bar - Filter bar"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Click a chip to toggle it (the selected chip shows a checkmark, per the stock{" "}
						<code className="wwc:rounded wwc:bg-muted wwc:px-1 wwc:text-xs">Chip</code> filter variant); the Filters
						button badge counts the active filters. The chip row scrolls horizontally when it overflows.
					</CardDescription>
				</CardHeader>
				<CardContent className="wwc:space-y-4">
					<MapFilterBar filters={FILTERS} value={selected} onValueChange={setSelected} onOpenFilters={() => {}} />
					<div className="wwc:font-mono wwc:text-xs wwc:text-muted-foreground">
						selected: [{selected.join(", ") || "—"}]
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Over a map</CardTitle>
						<CopyButton
							value="Map Filter Bar - Over a map"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>
						Floated over a map surface — the bar sits on a white card so it reads over imagery, and the chips scroll
						while the Filters button stays pinned.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="wwc:relative wwc:h-64 wwc:overflow-hidden wwc:rounded-lg wwc:border wwc:bg-muted">
						<div
							className="wwc:absolute wwc:inset-0 wwc:opacity-40"
							style={{
								backgroundImage:
									"linear-gradient(0deg, transparent 24%, rgba(0,0,0,0.06) 25%, rgba(0,0,0,0.06) 26%, transparent 27%, transparent 74%, rgba(0,0,0,0.06) 75%, rgba(0,0,0,0.06) 76%, transparent 77%), linear-gradient(90deg, transparent 24%, rgba(0,0,0,0.06) 25%, rgba(0,0,0,0.06) 26%, transparent 27%, transparent 74%, rgba(0,0,0,0.06) 75%, rgba(0,0,0,0.06) 76%, transparent 77%)",
								backgroundSize: "48px 48px",
							}}
						/>
						<div className="wwc:absolute wwc:inset-x-3 wwc:top-3">
							<div className="wwc:rounded-lg wwc:border wwc:border-border wwc:bg-background wwc:px-3 wwc:shadow-md">
								<MapFilterBar filters={FILTERS} defaultValue={["wifi"]} onOpenFilters={() => {}} />
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
