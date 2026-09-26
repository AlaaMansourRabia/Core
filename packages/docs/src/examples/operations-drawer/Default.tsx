import {Button} from "@corensystem/coren-ui/button";
/**
 * Default operations drawer for batch actions.
 */
import {
	OperationsDrawer,
	OperationsDrawerTrigger,
	OperationsDrawerContent,
	OperationsDrawerAction,
} from "@corensystem/coren-ui/operations-drawer";

export function Default() {
	return (
		<OperationsDrawer>
			<OperationsDrawerTrigger asChild>
				<Button>Operations</Button>
			</OperationsDrawerTrigger>
			<OperationsDrawerContent>
				<OperationsDrawerAction>Export All</OperationsDrawerAction>
				<OperationsDrawerAction>Import Data</OperationsDrawerAction>
				<OperationsDrawerAction>Sync</OperationsDrawerAction>
			</OperationsDrawerContent>
		</OperationsDrawer>
	);
}
