/**
 * Map hover card with thumbnail image.
 */
import {MapHoverCard, MapHoverCardImage, MapHoverCardTitle, MapHoverCardContent} from "@corensystem/coren-ui/map-hover-card";

export function WithImage() {
	return (
		<MapHoverCard>
			<MapHoverCardImage src="/property.jpg" alt="Property view" />
			<MapHoverCardTitle>Lakeside Villa</MapHoverCardTitle>
			<MapHoverCardContent>Premium waterfront property</MapHoverCardContent>
		</MapHoverCard>
	);
}
