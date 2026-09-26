/**
 * Walkthrough modal with actions.
 */
import {WalkthroughModal, WalkthroughModalStep, WalkthroughModalContent, WalkthroughModalActions} from "@corensystem/coren-ui/walkthrough-modal";
import {Button} from "@corensystem/coren-ui/button";

export function WithActions() {
	return (
		<WalkthroughModal open>
			<WalkthroughModalStep>
				<WalkthroughModalContent>Ready to get started?</WalkthroughModalContent>
				<WalkthroughModalActions>
					<Button variant="outline">Skip</Button>
					<Button>Next</Button>
				</WalkthroughModalActions>
			</WalkthroughModalStep>
		</WalkthroughModal>
	);
}
