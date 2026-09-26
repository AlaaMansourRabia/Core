/**
 * Maintain proportional segment sizes.
 */
import {BlueprintSegment, BlueprintSegmentLabel} from "@corensystem/coren-ui/blueprint-segment";

export function ScaleDo() {
	return (
		<div className="wwc:flex wwc:gap-1">
			<BlueprintSegment className="wwc:w-32 wwc:h-24">
				<BlueprintSegmentLabel>Large Room</BlueprintSegmentLabel>
			</BlueprintSegment>
			<BlueprintSegment className="wwc:w-16 wwc:h-24">
				<BlueprintSegmentLabel>Small</BlueprintSegmentLabel>
			</BlueprintSegment>
		</div>
	);
}
