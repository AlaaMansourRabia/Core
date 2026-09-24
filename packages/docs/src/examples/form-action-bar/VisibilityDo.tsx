/**
 * Show actions when form has changes.
 */
import {FormActionBar, FormActionBarButton} from "@corensystem/coren-ui/form-action-bar";

export function VisibilityDo() {
	return (
		<FormActionBar visible={true}>
			<FormActionBarButton variant="outline">Discard</FormActionBarButton>
			<FormActionBarButton>Save</FormActionBarButton>
		</FormActionBar>
	);
}
