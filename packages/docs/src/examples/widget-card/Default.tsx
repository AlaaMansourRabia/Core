/**
 * Basic widget card for dashboard content.
 */
import {WidgetCard, WidgetCardHeader, WidgetCardTitle, WidgetCardContent} from "@corensystem/coren-ui/widget-card";

export function Default() {
	return (
		<WidgetCard>
			<WidgetCardHeader>
				<WidgetCardTitle>Recent Activity</WidgetCardTitle>
			</WidgetCardHeader>
			<WidgetCardContent>
				<p className="wwc:text-sm wwc:text-muted-foreground">No recent activity to display.</p>
			</WidgetCardContent>
		</WidgetCard>
	);
}
