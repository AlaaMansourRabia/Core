/**
 * Form action bar with unsaved indicator.
 */
import {FormActionBar, FormActionBarButton, FormActionBarStatus} from "@corensystem/coren-ui/form-action-bar";

export function WithStatus() {
	return (
		<FormActionBar>
			<FormActionBarStatus>Unsaved changes</FormActionBarStatus>
			<FormActionBarButton variant="outline">Cancel</FormActionBarButton>
			<FormActionBarButton>Save</FormActionBarButton>
		</FormActionBar>
	);
}
