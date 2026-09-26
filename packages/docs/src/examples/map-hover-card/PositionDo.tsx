/**
 * Position card near marker.
 */
import {MapHoverCard, MapHoverCardTitle} from "@corensystem/coren-ui/map-hover-card";

export function PositionDo() {
	return (
		<div className="wwc:relative">
			<div className="wwc:w-4 wwc:h-4 wwc:bg-blue-500 wwc:rounded-full" />
			<MapHoverCard className="wwc:absolute wwc:left-6 wwc:top-0">
				<MapHoverCardTitle>Near marker</MapHoverCardTitle>
			</MapHoverCard>
		</div>
	);
}
