/**
 * Avoid reversed button order.
 */
import {FormActionBar, FormActionBarButton} from "@corensystem/coren-ui/form-action-bar";

export function OrderDont() {
	return (
		<FormActionBar>
			<FormActionBarButton>Save</FormActionBarButton>
			<FormActionBarButton variant="outline">Cancel</FormActionBarButton>
		</FormActionBar>
	);
}
