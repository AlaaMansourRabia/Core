/**
 * Use clear, descriptive titles.
 */
import {WidgetCard, WidgetCardHeader, WidgetCardTitle, WidgetCardContent} from "@corensystem/coren-ui/widget-card";

export function TitleDo() {
	return (
		<WidgetCard>
			<WidgetCardHeader>
				<WidgetCardTitle>Monthly Active Users</WidgetCardTitle>
			</WidgetCardHeader>
			<WidgetCardContent>
				<p className="wwc:text-2xl wwc:font-bold">12,345</p>
			</WidgetCardContent>
		</WidgetCard>
	);
}
