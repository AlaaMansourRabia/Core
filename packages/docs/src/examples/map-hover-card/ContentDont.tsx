/**
 * Avoid information overload.
 */
import {
	MapHoverCard,
	MapHoverCardTitle,
	MapHoverCardContent,
	MapHoverCardDetail,
} from "@corensystem/coren-ui/map-hover-card";

export function ContentDont() {
	return (
		<MapHoverCard className="wwc:w-64">
			<MapHoverCardTitle>Unit 12</MapHoverCardTitle>
			<MapHoverCardContent>
				<MapHoverCardDetail label="Status">Available</MapHoverCardDetail>
				<MapHoverCardDetail label="Size">1,200 sq ft</MapHoverCardDetail>
				<MapHoverCardDetail label="Floor">3rd</MapHoverCardDetail>
				<MapHoverCardDetail label="Built">2019</MapHoverCardDetail>
				<MapHoverCardDetail label="Renovated">2023</MapHoverCardDetail>
				<MapHoverCardDetail label="Amenities">Kitchen, AC, Parking</MapHoverCardDetail>
			</MapHoverCardContent>
		</MapHoverCard>
	);
}
