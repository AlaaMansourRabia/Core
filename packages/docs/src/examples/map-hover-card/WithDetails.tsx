/**
 * Map hover card with property details.
 */
import {MapHoverCard, MapHoverCardTitle, MapHoverCardContent, MapHoverCardDetail} from "@corensystem/coren-ui/map-hover-card";

export function WithDetails() {
	return (
		<MapHoverCard>
			<MapHoverCardTitle>Unit 4B</MapHoverCardTitle>
			<MapHoverCardContent>
				<MapHoverCardDetail label="Status">Available</MapHoverCardDetail>
				<MapHoverCardDetail label="Size">850 sq ft</MapHoverCardDetail>
				<MapHoverCardDetail label="Floor">4th</MapHoverCardDetail>
			</MapHoverCardContent>
		</MapHoverCard>
	);
}
