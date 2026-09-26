/**
 * Avoid using color without meaning.
 */
import {BlueprintSegment, BlueprintSegmentLabel} from "@corensystem/coren-ui/blueprint-segment";

export function ColorDont() {
	return (
		<div className="wwc:flex wwc:gap-2">
			<BlueprintSegment className="wwc:w-24 wwc:h-16 wwc:bg-pink-200">
				<BlueprintSegmentLabel>Zone A</BlueprintSegmentLabel>
			</BlueprintSegment>
			<BlueprintSegment className="wwc:w-24 wwc:h-16 wwc:bg-yellow-200">
				<BlueprintSegmentLabel>Zone B</BlueprintSegmentLabel>
			</BlueprintSegment>
		</div>
	);
}
