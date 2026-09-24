/**
 * Use clear action labels.
 */
import {FormActionBar, FormActionBarButton} from "@corensystem/coren-ui/form-action-bar";

export function LabelDo() {
	return (
		<FormActionBar>
			<FormActionBarButton variant="outline">Cancel</FormActionBarButton>
			<FormActionBarButton>Create Account</FormActionBarButton>
		</FormActionBar>
	);
}
