/**
 * Avoid cramming too much information in one widget.
 */
import {WidgetCard, WidgetCardHeader, WidgetCardTitle, WidgetCardContent} from "@corensystem/coren-ui/widget-card";

export function ContentDont() {
	return (
		<WidgetCard>
			<WidgetCardHeader>
				<WidgetCardTitle>Stats</WidgetCardTitle>
			</WidgetCardHeader>
			<WidgetCardContent className="wwc:text-xs">
				<p>Users: 1,234 | Revenue: $45,000 | Orders: 567 | Returns: 23</p>
				<p>Conversion: 3.2% | Bounce: 45% | Session: 2:34 | Pages: 4.5</p>
				<p>New: 234 | Returning: 1000 | Mobile: 60% | Desktop: 40%</p>
			</WidgetCardContent>
		</WidgetCard>
	);
}
