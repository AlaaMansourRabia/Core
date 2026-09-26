/**
 * Put primary action on the right.
 */
import {FormActionBar, FormActionBarButton} from "@corensystem/coren-ui/form-action-bar";

export function OrderDo() {
	return (
		<FormActionBar>
			<FormActionBarButton variant="outline">Cancel</FormActionBarButton>
			<FormActionBarButton>Save</FormActionBarButton>
		</FormActionBar>
	);
}
