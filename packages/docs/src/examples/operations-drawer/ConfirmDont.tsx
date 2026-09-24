/**
 * Avoid immediate destructive actions.
 */
import {OperationsDrawer, OperationsDrawerContent, OperationsDrawerAction} from "@corensystem/coren-ui/operations-drawer";

export function ConfirmDont() {
	return (
		<OperationsDrawer open>
			<OperationsDrawerContent>
				<OperationsDrawerAction variant="destructive">Delete All (No confirm)</OperationsDrawerAction>
			</OperationsDrawerContent>
		</OperationsDrawer>
	);
}
