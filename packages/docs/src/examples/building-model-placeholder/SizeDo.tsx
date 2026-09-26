/**
 * Use appropriate placeholder size for container.
 */
import {BuildingModelPlaceholder} from "@corensystem/coren-ui/building-model-placeholder";

export function SizeDo() {
	return (
		<div className="wwc:w-full wwc:h-64 wwc:border wwc:rounded">
			<BuildingModelPlaceholder className="wwc:w-full wwc:h-full" />
		</div>
	);
}
