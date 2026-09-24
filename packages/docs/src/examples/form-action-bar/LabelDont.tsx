/**
 * Avoid vague button labels.
 */
import {FormActionBar, FormActionBarButton} from "@corensystem/coren-ui/form-action-bar";

export function LabelDont() {
	return (
		<FormActionBar>
			<FormActionBarButton variant="outline">No</FormActionBarButton>
			<FormActionBarButton>Yes</FormActionBarButton>
		</FormActionBar>
	);
}
