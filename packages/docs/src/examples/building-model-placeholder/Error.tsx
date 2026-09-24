/**
 * Building model placeholder in error state.
 */
import {BuildingModelPlaceholder, BuildingModelPlaceholderMessage} from "@corensystem/coren-ui/building-model-placeholder";

export function Error() {
	return (
		<BuildingModelPlaceholder error className="wwc:w-64 wwc:h-48">
			<BuildingModelPlaceholderMessage>Failed to load model</BuildingModelPlaceholderMessage>
		</BuildingModelPlaceholder>
	);
}
