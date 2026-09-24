/**
 * Default violation list.
 */
import {ViolationList, ViolationItem} from "@corensystem/coren-ui/violation-list";

export function Default() {
	return (
		<ViolationList>
			<ViolationItem severity="error">Missing required field</ViolationItem>
			<ViolationItem severity="warning">Value exceeds limit</ViolationItem>
		</ViolationList>
	);
}
