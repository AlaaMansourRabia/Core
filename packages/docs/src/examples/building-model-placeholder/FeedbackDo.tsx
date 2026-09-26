/**
 * Show loading progress when possible.
 */
import {
	BuildingModelPlaceholder,
	BuildingModelPlaceholderProgress,
} from "@corensystem/coren-ui/building-model-placeholder";

export function FeedbackDo() {
	return (
		<BuildingModelPlaceholder loading className="wwc:w-64 wwc:h-48">
			<BuildingModelPlaceholderProgress value={65} />
		</BuildingModelPlaceholder>
	);
}
