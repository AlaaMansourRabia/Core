/**
 * Default map hover card for location info.
 */
import {MapHoverCard, MapHoverCardTitle, MapHoverCardContent} from "@corensystem/coren-ui/map-hover-card";

export function Default() {
	return (
		<MapHoverCard>
			<MapHoverCardTitle>Building A</MapHoverCardTitle>
			<MapHoverCardContent>123 Main Street</MapHoverCardContent>
		</MapHoverCard>
	);
}
