/**
 * Form action bar with secondary actions.
 */
import {FormActionBar, FormActionBarButton, FormActionBarSecondary} from "@corensystem/coren-ui/form-action-bar";

export function WithSecondary() {
	return (
		<FormActionBar>
			<FormActionBarSecondary>
				<FormActionBarButton variant="ghost">Reset</FormActionBarButton>
			</FormActionBarSecondary>
			<FormActionBarButton variant="outline">Cancel</FormActionBarButton>
			<FormActionBarButton>Submit</FormActionBarButton>
		</FormActionBar>
	);
}
