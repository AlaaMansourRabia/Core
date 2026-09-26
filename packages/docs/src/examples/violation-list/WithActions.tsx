/**
 * Violation list with fix actions.
 */
import {ViolationList, ViolationItem, ViolationItemAction} from "@corensystem/coren-ui/violation-list";

export function WithActions() {
	return (
		<ViolationList>
			<ViolationItem severity="warning">
				Deprecated API usage
				<ViolationItemAction>Auto-fix</ViolationItemAction>
			</ViolationItem>
		</ViolationList>
	);
}
