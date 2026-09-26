/**
 * Building model placeholder with custom message.
 */
import {BuildingModelPlaceholder, BuildingModelPlaceholderMessage} from "@corensystem/coren-ui/building-model-placeholder";

export function WithMessage() {
	return (
		<BuildingModelPlaceholder className="wwc:w-64 wwc:h-48">
			<BuildingModelPlaceholderMessage>Loading 3D model...</BuildingModelPlaceholderMessage>
		</BuildingModelPlaceholder>
	);
}
