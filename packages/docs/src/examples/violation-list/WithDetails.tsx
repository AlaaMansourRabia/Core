/**
 * Violation list with details.
 */
import {ViolationList, ViolationItem, ViolationItemDetails} from "@corensystem/coren-ui/violation-list";

export function WithDetails() {
	return (
		<ViolationList>
			<ViolationItem severity="error">
				Invalid format
				<ViolationItemDetails>Expected: YYYY-MM-DD</ViolationItemDetails>
			</ViolationItem>
		</ViolationList>
	);
}
