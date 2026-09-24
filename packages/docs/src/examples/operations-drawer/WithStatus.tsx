/**
 * Operations drawer with running status.
 */
import {OperationsDrawer, OperationsDrawerContent, OperationsDrawerStatus} from "@corensystem/coren-ui/operations-drawer";

export function WithStatus() {
	return (
		<OperationsDrawer open>
			<OperationsDrawerContent>
				<OperationsDrawerStatus status="running">Processing 45 items...</OperationsDrawerStatus>
			</OperationsDrawerContent>
		</OperationsDrawer>
	);
}
