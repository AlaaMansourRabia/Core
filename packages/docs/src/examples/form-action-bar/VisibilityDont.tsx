/**
 * Avoid always showing disabled actions.
 */
import {FormActionBar, FormActionBarButton} from "@corensystem/coren-ui/form-action-bar";

export function VisibilityDont() {
	return (
		<FormActionBar>
			<FormActionBarButton variant="outline" disabled>Discard</FormActionBarButton>
			<FormActionBarButton disabled>Save</FormActionBarButton>
		</FormActionBar>
	);
}
