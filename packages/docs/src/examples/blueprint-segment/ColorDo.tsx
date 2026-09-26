/**
 * Use color to indicate status consistently.
 */
import {BlueprintSegment, BlueprintSegmentLabel} from "@corensystem/coren-ui/blueprint-segment";

export function ColorDo() {
	return (
		<div className="wwc:flex wwc:gap-2">
			<BlueprintSegment status="available" className="wwc:w-24 wwc:h-16">
				<BlueprintSegmentLabel>Open</BlueprintSegmentLabel>
			</BlueprintSegment>
			<BlueprintSegment status="occupied" className="wwc:w-24 wwc:h-16">
				<BlueprintSegmentLabel>In Use</BlueprintSegmentLabel>
			</BlueprintSegment>
		</div>
	);
}
