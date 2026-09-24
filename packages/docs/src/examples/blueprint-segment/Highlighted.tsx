/**
 * Highlighted blueprint segment for selection.
 */
import {BlueprintSegment, BlueprintSegmentLabel, BlueprintSegmentArea} from "@corensystem/coren-ui/blueprint-segment";

export function Highlighted() {
	return (
		<BlueprintSegment highlighted className="wwc:w-64 wwc:h-32">
			<BlueprintSegmentLabel>Selected Zone</BlueprintSegmentLabel>
			<BlueprintSegmentArea>85 sq ft</BlueprintSegmentArea>
		</BlueprintSegment>
	);
}
