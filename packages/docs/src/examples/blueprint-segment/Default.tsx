/**
 * Default blueprint segment for floor plan sections.
 */
import {BlueprintSegment, BlueprintSegmentLabel, BlueprintSegmentArea} from "@corensystem/coren-ui/blueprint-segment";

export function Default() {
	return (
		<BlueprintSegment className="wwc:w-64 wwc:h-32">
			<BlueprintSegmentLabel>Zone A</BlueprintSegmentLabel>
			<BlueprintSegmentArea>120 sq ft</BlueprintSegmentArea>
		</BlueprintSegment>
	);
}
