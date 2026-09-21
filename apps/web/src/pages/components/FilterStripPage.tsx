import {useState} from "react";

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {CoreFilterStrip} from "@/components/ui/navigation/core-filter-strip";

export function FilterStripPage() {
	const [filters, setFilters] = useState<Record<string, unknown>>({});

	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">Filter Strip</h1>
					<CopyButton
						value="Filter Strip"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Horizontal filter strip with variant-specific controls. Supports date range, project, zone, trade, and status
					filters with active filter pills and clear-all functionality.
				</p>
			</div>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Performance</CardTitle>
						<CopyButton
							value="Filter Strip - Performance"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Filters tailored for performance dashboards: date range, project, and zone.</CardDescription>
				</CardHeader>
				<CardContent>
					<CoreFilterStrip variant="performance" onFiltersChange={setFilters} />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Workforce</CardTitle>
						<CopyButton
							value="Filter Strip - Workforce"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Filters for workforce dashboards: project, zone, trade, status.</CardDescription>
				</CardHeader>
				<CardContent>
					<CoreFilterStrip variant="workforce" onFiltersChange={setFilters} />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Reality Capture</CardTitle>
						<CopyButton
							value="Filter Strip - Reality Capture"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Reality capture variant.</CardDescription>
				</CardHeader>
				<CardContent>
					<CoreFilterStrip variant="reality-capture" onFiltersChange={setFilters} />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Small Size</CardTitle>
						<CopyButton
							value="Filter Strip - Small Size"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Compact strip with smaller dropdowns for dense layouts.</CardDescription>
				</CardHeader>
				<CardContent className="wwc:space-y-4">
					<CoreFilterStrip variant="performance" size="sm" onFiltersChange={setFilters} />
					<CoreFilterStrip variant="workforce" size="sm" onFiltersChange={setFilters} />
					<CoreFilterStrip variant="reality-capture" size="sm" onFiltersChange={setFilters} />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
						<CardTitle>Current Filters</CardTitle>
						<CopyButton
							value="Filter Strip - Current Filters"
							className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
						/>
					</div>
					<CardDescription>Live state echoed back from onFiltersChange.</CardDescription>
				</CardHeader>
				<CardContent>
					<pre className="wwc:text-xs wwc:bg-muted wwc:p-4 wwc:rounded-md wwc:overflow-x-auto">
						{JSON.stringify(filters, null, 2)}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
