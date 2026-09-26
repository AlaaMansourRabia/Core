/**
 * Avoid cryptic zone labels.
 */
import {BlueprintSegment, BlueprintSegmentLabel} from "@corensystem/coren-ui/blueprint-segment";

export function LabelDont() {
	return (
		<BlueprintSegment className="wwc:w-48 wwc:h-24">
			<BlueprintSegmentLabel>CR1-F2-B3</BlueprintSegmentLabel>
		</BlueprintSegment>
	);
}
