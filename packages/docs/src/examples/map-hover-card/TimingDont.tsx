/**
 * Avoid instant or slow appearance.
 */
import {MapHoverCard, MapHoverCardTitle} from "@corensystem/coren-ui/map-hover-card";

export function TimingDont() {
	return (
		<MapHoverCard delay={0}>
			<MapHoverCardTitle>Appears instantly (distracting)</MapHoverCardTitle>
		</MapHoverCard>
	);
}
