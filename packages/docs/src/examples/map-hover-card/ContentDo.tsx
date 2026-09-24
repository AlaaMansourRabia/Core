/**
 * Show essential info only.
 */
import {MapHoverCard, MapHoverCardTitle, MapHoverCardContent} from "@corensystem/coren-ui/map-hover-card";

export function ContentDo() {
	return (
		<MapHoverCard>
			<MapHoverCardTitle>Unit 12</MapHoverCardTitle>
			<MapHoverCardContent>Available • 1,200 sq ft</MapHoverCardContent>
		</MapHoverCard>
	);
}
