/**
 * Blueprint segment with status indicator.
 */
import {BlueprintSegment, BlueprintSegmentLabel, BlueprintSegmentStatus} from "@corensystem/coren-ui/blueprint-segment";

export function WithStatus() {
	return (
		<BlueprintSegment className="wwc:w-64 wwc:h-32">
			<BlueprintSegmentLabel>Meeting Room</BlueprintSegmentLabel>
			<BlueprintSegmentStatus status="occupied">In Use</BlueprintSegmentStatus>
		</BlueprintSegment>
	);
}
