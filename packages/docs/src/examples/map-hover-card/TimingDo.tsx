/**
 * Show card with slight delay.
 */
import {MapHoverCard, MapHoverCardTitle} from "@corensystem/coren-ui/map-hover-card";

export function TimingDo() {
	return (
		<MapHoverCard delay={200}>
			<MapHoverCardTitle>Appears after hover</MapHoverCardTitle>
		</MapHoverCard>
	);
}
