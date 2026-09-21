// Read-only display for `derived_count`: shows a computed number prominently (or an em-dash when
// undefined) with a small muted caption. Not editable. Standalone + frozen prop contract so the RJSF
// widget can wrap it.
import {dataSourceByKey} from "./dataSources";

export interface DerivedCountDisplayProps {
	/** The computed count, or undefined when it can't be derived yet. */
	value?: number;
	/** Optional data source key — its `countNoun` becomes the caption. */
	source?: string;
}

export function DerivedCountDisplay({value, source}: DerivedCountDisplayProps) {
	const caption = dataSourceByKey(source)?.countNoun ?? "derived";

	return (
		<div className="wwc:flex wwc:flex-col wwc:gap-0.5">
			<span className="wwc:text-3xl wwc:font-semibold wwc:tabular-nums wwc:text-foreground">
				{value === undefined ? "—" : value}
			</span>
			<span className="wwc:text-xs wwc:text-muted-foreground">{caption}</span>
		</div>
	);
}
