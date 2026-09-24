/**
 * Widget card in loading state.
 */
import {WidgetCard, WidgetCardHeader, WidgetCardTitle, WidgetCardContent} from "@corensystem/coren-ui/widget-card";
import {Skeleton} from "@corensystem/coren-ui/skeleton";

export function Loading() {
	return (
		<WidgetCard>
			<WidgetCardHeader>
				<WidgetCardTitle>Analytics</WidgetCardTitle>
			</WidgetCardHeader>
			<WidgetCardContent>
				<div className="wwc:space-y-2">
					<Skeleton className="wwc:h-8 wwc:w-24" />
					<Skeleton className="wwc:h-4 wwc:w-32" />
				</div>
			</WidgetCardContent>
		</WidgetCard>
	);
}
