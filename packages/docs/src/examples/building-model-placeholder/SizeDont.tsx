/**
 * Avoid mismatched placeholder sizes.
 */
import {BuildingModelPlaceholder} from "@corensystem/coren-ui/building-model-placeholder";

export function SizeDont() {
	return (
		<div className="wwc:w-full wwc:h-64 wwc:border wwc:rounded">
			<BuildingModelPlaceholder className="wwc:w-24 wwc:h-24" />
		</div>
	);
}
