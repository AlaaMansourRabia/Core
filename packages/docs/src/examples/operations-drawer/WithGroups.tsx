/**
 * Operations drawer with action groups.
 */
import {OperationsDrawer, OperationsDrawerTrigger, OperationsDrawerContent, OperationsDrawerGroup, OperationsDrawerAction} from "@corensystem/coren-ui/operations-drawer";
import {Button} from "@corensystem/coren-ui/button";

export function WithGroups() {
	return (
		<OperationsDrawer>
			<OperationsDrawerTrigger asChild>
				<Button>Actions</Button>
			</OperationsDrawerTrigger>
			<OperationsDrawerContent>
				<OperationsDrawerGroup label="Data">
					<OperationsDrawerAction>Import</OperationsDrawerAction>
					<OperationsDrawerAction>Export</OperationsDrawerAction>
				</OperationsDrawerGroup>
				<OperationsDrawerGroup label="System">
					<OperationsDrawerAction>Clear Cache</OperationsDrawerAction>
					<OperationsDrawerAction>Reset</OperationsDrawerAction>
				</OperationsDrawerGroup>
			</OperationsDrawerContent>
		</OperationsDrawer>
	);
}
