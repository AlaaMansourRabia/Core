/**
 * Confirm destructive operations.
 */
import {
	OperationsDrawer,
	OperationsDrawerContent,
	OperationsDrawerAction,
} from "@corensystem/coren-ui/operations-drawer";

export function ConfirmDo() {
	return (
		<OperationsDrawer open>
			<OperationsDrawerContent>
				<OperationsDrawerAction variant="destructive" confirm>
					Delete All
				</OperationsDrawerAction>
			</OperationsDrawerContent>
		</OperationsDrawer>
	);
}
