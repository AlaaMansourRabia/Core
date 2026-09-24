/**
 * Default walkthrough modal.
 */
import {WalkthroughModal, WalkthroughModalStep, WalkthroughModalContent} from "@corensystem/coren-ui/walkthrough-modal";

export function Default() {
	return (
		<WalkthroughModal open>
			<WalkthroughModalStep>
				<WalkthroughModalContent>Welcome to the app!</WalkthroughModalContent>
			</WalkthroughModalStep>
		</WalkthroughModal>
	);
}
