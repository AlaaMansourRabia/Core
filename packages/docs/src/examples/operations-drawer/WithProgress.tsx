/**
 * Operations drawer with progress indicator.
 */
import {OperationsDrawer, OperationsDrawerContent, OperationsDrawerProgress} from "@corensystem/coren-ui/operations-drawer";

export function WithProgress() {
	return (
		<OperationsDrawer open>
			<OperationsDrawerContent>
				<OperationsDrawerProgress value={65} label="Exporting data..." />
			</OperationsDrawerContent>
		</OperationsDrawer>
	);
}
