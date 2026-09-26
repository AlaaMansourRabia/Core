/**
 * Grid of blueprint segments for floor layout.
 */
import {BlueprintSegment, BlueprintSegmentLabel} from "@corensystem/coren-ui/blueprint-segment";

export function Grid() {
	return (
		<div className="wwc:grid wwc:grid-cols-3 wwc:gap-1">
			<BlueprintSegment className="wwc:h-24">
				<BlueprintSegmentLabel>A1</BlueprintSegmentLabel>
			</BlueprintSegment>
			<BlueprintSegment className="wwc:h-24">
				<BlueprintSegmentLabel>A2</BlueprintSegmentLabel>
			</BlueprintSegment>
			<BlueprintSegment className="wwc:h-24">
				<BlueprintSegmentLabel>A3</BlueprintSegmentLabel>
			</BlueprintSegment>
			<BlueprintSegment className="wwc:h-24">
				<BlueprintSegmentLabel>B1</BlueprintSegmentLabel>
			</BlueprintSegment>
			<BlueprintSegment className="wwc:h-24">
				<BlueprintSegmentLabel>B2</BlueprintSegmentLabel>
			</BlueprintSegment>
			<BlueprintSegment className="wwc:h-24">
				<BlueprintSegmentLabel>B3</BlueprintSegmentLabel>
			</BlueprintSegment>
		</div>
	);
}
