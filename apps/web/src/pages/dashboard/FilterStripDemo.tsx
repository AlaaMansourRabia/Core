import {useState} from "react";

import {CoreFilterStrip} from "@/components/ui/navigation/core-filter-strip";

export function FilterStripDemo() {
	const [filters, setFilters] = useState<Record<string, unknown>>({});

	return (
		<div className="wwc:space-y-8">
			<div>
				<h1 className="wwc:text-3xl wwc:font-bold">Filter Strip</h1>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Contextual filter controls for different dashboard views. Available in default and compact sizes.
				</p>
			</div>

			<div className="wwc:space-y-6">
				<div>
					<h3 className="wwc:text-lg wwc:font-semibold wwc:mb-1">Default Size</h3>
					<p className="wwc:text-sm wwc:text-muted-foreground wwc:mb-3">
						Standard filter strip with default-sized dropdowns.
					</p>
				</div>

				<div>
					<h4 className="wwc:text-sm wwc:font-medium wwc:text-muted-foreground wwc:mb-2">Performance Variant</h4>
					<div className="wwc:border wwc:rounded-lg">
						<CoreFilterStrip variant="performance" onFiltersChange={setFilters} />
					</div>
				</div>

				<div>
					<h4 className="wwc:text-sm wwc:font-medium wwc:text-muted-foreground wwc:mb-2">Workforce Variant</h4>
					<div className="wwc:border wwc:rounded-lg">
						<CoreFilterStrip variant="workforce" onFiltersChange={setFilters} />
					</div>
				</div>

				<div>
					<h4 className="wwc:text-sm wwc:font-medium wwc:text-muted-foreground wwc:mb-2">Reality Capture Variant</h4>
					<div className="wwc:border wwc:rounded-lg">
						<CoreFilterStrip variant="reality-capture" onFiltersChange={setFilters} />
					</div>
				</div>
			</div>

			<div className="wwc:space-y-6">
				<div>
					<h3 className="wwc:text-lg wwc:font-semibold wwc:mb-1">Small Size</h3>
					<p className="wwc:text-sm wwc:text-muted-foreground wwc:mb-3">
						Compact filter strip with smaller dropdowns for dense layouts.
					</p>
				</div>

				<div>
					<h4 className="wwc:text-sm wwc:font-medium wwc:text-muted-foreground wwc:mb-2">Performance Variant</h4>
					<div className="wwc:border wwc:rounded-lg">
						<CoreFilterStrip variant="performance" size="sm" onFiltersChange={setFilters} />
					</div>
				</div>

				<div>
					<h4 className="wwc:text-sm wwc:font-medium wwc:text-muted-foreground wwc:mb-2">Workforce Variant</h4>
					<div className="wwc:border wwc:rounded-lg">
						<CoreFilterStrip variant="workforce" size="sm" onFiltersChange={setFilters} />
					</div>
				</div>

				<div>
					<h4 className="wwc:text-sm wwc:font-medium wwc:text-muted-foreground wwc:mb-2">Reality Capture Variant</h4>
					<div className="wwc:border wwc:rounded-lg">
						<CoreFilterStrip variant="reality-capture" size="sm" onFiltersChange={setFilters} />
					</div>
				</div>
			</div>

			<div className="wwc:p-4 wwc:bg-muted wwc:rounded-lg">
				<p className="wwc:text-sm wwc:font-medium wwc:mb-2">Current Filters:</p>
				<pre className="wwc:text-xs">{JSON.stringify(filters, null, 2)}</pre>
			</div>
		</div>
	);
}
