import {Button} from "@corensystem/coren-ui/button";
/**
 * Widget card with header actions.
 */
import {
	WidgetCard,
	WidgetCardHeader,
	WidgetCardTitle,
	WidgetCardActions,
	WidgetCardContent,
} from "@corensystem/coren-ui/widget-card";
import {MoreHorizontal, RefreshCw} from "lucide-react";

export function WithActions() {
	return (
		<WidgetCard>
			<WidgetCardHeader>
				<WidgetCardTitle>Sales Overview</WidgetCardTitle>
				<WidgetCardActions>
					<Button variant="ghost" size="icon">
						<RefreshCw className="wwc:h-4 wwc:w-4" />
					</Button>
					<Button variant="ghost" size="icon">
						<MoreHorizontal className="wwc:h-4 wwc:w-4" />
					</Button>
				</WidgetCardActions>
			</WidgetCardHeader>
			<WidgetCardContent>
				<p className="wwc:text-2xl wwc:font-bold">$12,450</p>
				<p className="wwc:text-sm wwc:text-muted-foreground">+12% from last month</p>
			</WidgetCardContent>
		</WidgetCard>
	);
}
