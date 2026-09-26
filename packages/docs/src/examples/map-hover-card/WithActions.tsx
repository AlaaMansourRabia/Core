import {Button} from "@corensystem/coren-ui/button";
/**
 * Map hover card with action buttons.
 */
import {
	MapHoverCard,
	MapHoverCardTitle,
	MapHoverCardContent,
	MapHoverCardActions,
} from "@corensystem/coren-ui/map-hover-card";

export function WithActions() {
	return (
		<MapHoverCard>
			<MapHoverCardTitle>Office Space</MapHoverCardTitle>
			<MapHoverCardContent>2,500 sq ft available</MapHoverCardContent>
			<MapHoverCardActions>
				<Button size="sm" variant="outline">
					Details
				</Button>
				<Button size="sm">Book Tour</Button>
			</MapHoverCardActions>
		</MapHoverCard>
	);
}
