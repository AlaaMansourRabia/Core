/**
 * Grouped violation list.
 */
import {ViolationList, ViolationGroup, ViolationItem} from "@corensystem/coren-ui/violation-list";

export function Grouped() {
	return (
		<ViolationList>
			<ViolationGroup label="Errors (2)">
				<ViolationItem severity="error">Error 1</ViolationItem>
				<ViolationItem severity="error">Error 2</ViolationItem>
			</ViolationGroup>
			<ViolationGroup label="Warnings (1)">
				<ViolationItem severity="warning">Warning 1</ViolationItem>
			</ViolationGroup>
		</ViolationList>
	);
}
