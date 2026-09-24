/**
 * Walkthrough modal with image.
 */
import {WalkthroughModal, WalkthroughModalStep, WalkthroughModalImage, WalkthroughModalContent} from "@corensystem/coren-ui/walkthrough-modal";

export function WithImage() {
	return (
		<WalkthroughModal open>
			<WalkthroughModalStep>
				<WalkthroughModalImage src="/onboarding.png" alt="Feature preview" />
				<WalkthroughModalContent>Check out our new feature!</WalkthroughModalContent>
			</WalkthroughModalStep>
		</WalkthroughModal>
	);
}
