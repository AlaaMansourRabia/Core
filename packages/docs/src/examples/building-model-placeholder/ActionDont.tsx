/**
 * Avoid error states without recovery options.
 */
import {BuildingModelPlaceholder, BuildingModelPlaceholderMessage} from "@corensystem/coren-ui/building-model-placeholder";

export function ActionDont() {
	return (
		<BuildingModelPlaceholder error className="wwc:w-64 wwc:h-48">
			<BuildingModelPlaceholderMessage>Error</BuildingModelPlaceholderMessage>
		</BuildingModelPlaceholder>
	);
}
