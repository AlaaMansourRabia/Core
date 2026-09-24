/**
 * Keep widget content focused and scannable.
 */
import {WidgetCard, WidgetCardHeader, WidgetCardTitle, WidgetCardContent} from "@corensystem/coren-ui/widget-card";

export function ContentDo() {
	return (
		<WidgetCard>
			<WidgetCardHeader>
				<WidgetCardTitle>Conversion Rate</WidgetCardTitle>
			</WidgetCardHeader>
			<WidgetCardContent>
				<p className="wwc:text-3xl wwc:font-bold">3.2%</p>
				<p className="wwc:text-sm wwc:text-green-600">+0.5% from last week</p>
			</WidgetCardContent>
		</WidgetCard>
	);
}
