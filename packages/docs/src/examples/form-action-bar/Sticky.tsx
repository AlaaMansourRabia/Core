/**
 * Sticky form action bar at bottom.
 */
import {FormActionBar, FormActionBarButton} from "@corensystem/coren-ui/form-action-bar";

export function Sticky() {
	return (
		<FormActionBar sticky>
			<FormActionBarButton variant="outline">Discard</FormActionBarButton>
			<FormActionBarButton>Save Changes</FormActionBarButton>
		</FormActionBar>
	);
}
