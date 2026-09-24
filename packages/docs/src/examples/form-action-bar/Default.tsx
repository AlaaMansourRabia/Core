/**
 * Default form action bar with submit/cancel.
 */
import {FormActionBar, FormActionBarButton} from "@corensystem/coren-ui/form-action-bar";

export function Default() {
	return (
		<FormActionBar>
			<FormActionBarButton variant="outline">Cancel</FormActionBarButton>
			<FormActionBarButton>Save</FormActionBarButton>
		</FormActionBar>
	);
}
