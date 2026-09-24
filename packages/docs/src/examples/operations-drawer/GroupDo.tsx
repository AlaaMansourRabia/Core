/**
 * Group related operations.
 */
import {OperationsDrawer, OperationsDrawerContent, OperationsDrawerGroup, OperationsDrawerAction} from "@corensystem/coren-ui/operations-drawer";

export function GroupDo() {
	return (
		<OperationsDrawer open>
			<OperationsDrawerContent>
				<OperationsDrawerGroup label="File">
					<OperationsDrawerAction>Import</OperationsDrawerAction>
					<OperationsDrawerAction>Export</OperationsDrawerAction>
				</OperationsDrawerGroup>
			</OperationsDrawerContent>
		</OperationsDrawer>
	);
}
