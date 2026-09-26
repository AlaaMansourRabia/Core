import {Link} from "@corensystem/coren-ui/link";
/**
 * Widget card with footer link.
 */
import {
	WidgetCard,
	WidgetCardHeader,
	WidgetCardTitle,
	WidgetCardContent,
	WidgetCardFooter,
} from "@corensystem/coren-ui/widget-card";

export function WithFooter() {
	return (
		<WidgetCard>
			<WidgetCardHeader>
				<WidgetCardTitle>Team Members</WidgetCardTitle>
			</WidgetCardHeader>
			<WidgetCardContent>
				<p className="wwc:text-3xl wwc:font-bold">24</p>
				<p className="wwc:text-sm wwc:text-muted-foreground">Active members</p>
			</WidgetCardContent>
			<WidgetCardFooter>
				<Link href="#">View all members</Link>
			</WidgetCardFooter>
		</WidgetCard>
	);
}
