/**
 * Provide retry action on error.
 */
import {
	BuildingModelPlaceholder,
	BuildingModelPlaceholderMessage,
	BuildingModelPlaceholderAction,
} from "@corensystem/coren-ui/building-model-placeholder";

export function ActionDo() {
	return (
		<BuildingModelPlaceholder error className="wwc:w-64 wwc:h-48">
			<BuildingModelPlaceholderMessage>Load failed</BuildingModelPlaceholderMessage>
			<BuildingModelPlaceholderAction>Retry</BuildingModelPlaceholderAction>
		</BuildingModelPlaceholder>
	);
}
