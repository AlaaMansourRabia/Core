/**
 * Avoid inconsistent widget heights.
 */
import {WidgetCard, WidgetCardHeader, WidgetCardTitle, WidgetCardContent} from "@corensystem/coren-ui/widget-card";

export function SizingDont() {
	return (
		<div className="wwc:flex wwc:gap-4">
			<WidgetCard className="wwc:h-24">
				<WidgetCardHeader>
					<WidgetCardTitle>Users</WidgetCardTitle>
				</WidgetCardHeader>
				<WidgetCardContent>
					<p>1,234</p>
				</WidgetCardContent>
			</WidgetCard>
			<WidgetCard className="wwc:h-48">
				<WidgetCardHeader>
					<WidgetCardTitle>Revenue</WidgetCardTitle>
				</WidgetCardHeader>
				<WidgetCardContent>
					<p>$45K</p>
					<p>This month</p>
					<p>+12% growth</p>
				</WidgetCardContent>
			</WidgetCard>
		</div>
	);
}
