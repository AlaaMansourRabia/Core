/**
 * Avoid vague or abbreviated titles.
 */
import {WidgetCard, WidgetCardHeader, WidgetCardTitle, WidgetCardContent} from "@corensystem/coren-ui/widget-card";

export function TitleDont() {
	return (
		<WidgetCard>
			<WidgetCardHeader>
				<WidgetCardTitle>MAU</WidgetCardTitle>
			</WidgetCardHeader>
			<WidgetCardContent>
				<p className="wwc:text-2xl wwc:font-bold">12,345</p>
			</WidgetCardContent>
		</WidgetCard>
	);
}
