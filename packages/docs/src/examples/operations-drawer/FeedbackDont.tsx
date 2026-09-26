/**
 * Avoid no feedback during operations.
 */
import {OperationsDrawer, OperationsDrawerContent} from "@corensystem/coren-ui/operations-drawer";

export function FeedbackDont() {
	return (
		<OperationsDrawer open>
			<OperationsDrawerContent>
				<span className="wwc:text-muted-foreground">Please wait...</span>
			</OperationsDrawerContent>
		</OperationsDrawer>
	);
}
