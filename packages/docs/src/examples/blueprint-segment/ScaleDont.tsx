/**
 * Avoid segments that don't reflect actual proportions.
 */
import {BlueprintSegment, BlueprintSegmentLabel} from "@corensystem/coren-ui/blueprint-segment";

export function ScaleDont() {
	return (
		<div className="wwc:flex wwc:gap-1">
			<BlueprintSegment className="wwc:w-24 wwc:h-24">
				<BlueprintSegmentLabel>Large Room</BlueprintSegmentLabel>
			</BlueprintSegment>
			<BlueprintSegment className="wwc:w-24 wwc:h-24">
				<BlueprintSegmentLabel>Small</BlueprintSegmentLabel>
			</BlueprintSegment>
		</div>
	);
}
