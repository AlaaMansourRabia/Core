/**
 * Avoid ungrouped long lists.
 */
import {
	OperationsDrawer,
	OperationsDrawerContent,
	OperationsDrawerAction,
} from "@corensystem/coren-ui/operations-drawer";

export function GroupDont() {
	return (
		<OperationsDrawer open>
			<OperationsDrawerContent>
				<OperationsDrawerAction>Import</OperationsDrawerAction>
				<OperationsDrawerAction>Export</OperationsDrawerAction>
				<OperationsDrawerAction>Clear</OperationsDrawerAction>
				<OperationsDrawerAction>Reset</OperationsDrawerAction>
				<OperationsDrawerAction>Sync</OperationsDrawerAction>
				<OperationsDrawerAction>Backup</OperationsDrawerAction>
			</OperationsDrawerContent>
		</OperationsDrawer>
	);
}
