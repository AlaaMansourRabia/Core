/**
 * Use consistent widget sizes in dashboards.
 */
import {WidgetCard, WidgetCardHeader, WidgetCardTitle, WidgetCardContent} from "@corensystem/coren-ui/widget-card";

export function SizingDo() {
	return (
		<div className="wwc:grid wwc:grid-cols-2 wwc:gap-4">
			<WidgetCard>
				<WidgetCardHeader>
					<WidgetCardTitle>Users</WidgetCardTitle>
				</WidgetCardHeader>
				<WidgetCardContent>
					<p className="wwc:text-2xl wwc:font-bold">1,234</p>
				</WidgetCardContent>
			</WidgetCard>
			<WidgetCard>
				<WidgetCardHeader>
					<WidgetCardTitle>Revenue</WidgetCardTitle>
				</WidgetCardHeader>
				<WidgetCardContent>
					<p className="wwc:text-2xl wwc:font-bold">$45K</p>
				</WidgetCardContent>
			</WidgetCard>
		</div>
	);
}
