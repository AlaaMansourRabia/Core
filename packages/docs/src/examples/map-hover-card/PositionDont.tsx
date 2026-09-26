/**
 * Avoid card obscuring marker.
 */
import {MapHoverCard, MapHoverCardTitle} from "@corensystem/coren-ui/map-hover-card";

export function PositionDont() {
	return (
		<div className="wwc:relative">
			<div className="wwc:w-4 wwc:h-4 wwc:bg-blue-500 wwc:rounded-full" />
			<MapHoverCard className="wwc:absolute wwc:-left-2 wwc:-top-2">
				<MapHoverCardTitle>Covering marker</MapHoverCardTitle>
			</MapHoverCard>
		</div>
	);
}
