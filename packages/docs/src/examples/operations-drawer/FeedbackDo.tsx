/**
 * Show operation progress.
 */
import {OperationsDrawer, OperationsDrawerContent, OperationsDrawerProgress} from "@corensystem/coren-ui/operations-drawer";

export function FeedbackDo() {
	return (
		<OperationsDrawer open>
			<OperationsDrawerContent>
				<OperationsDrawerProgress value={30} label="Importing: 30%" />
			</OperationsDrawerContent>
		</OperationsDrawer>
	);
}
