/**
 * Avoid no feedback during long loads.
 */
import {BuildingModelPlaceholder} from "@corensystem/coren-ui/building-model-placeholder";

export function FeedbackDont() {
	return <BuildingModelPlaceholder className="wwc:w-64 wwc:h-48" />;
}
