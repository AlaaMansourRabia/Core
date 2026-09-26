/**
 * Multi-step walkthrough modal.
 */
import {
	WalkthroughModal,
	WalkthroughModalStep,
	WalkthroughModalContent,
	WalkthroughModalProgress,
} from "@corensystem/coren-ui/walkthrough-modal";

export function MultiStep() {
	return (
		<WalkthroughModal open currentStep={1} totalSteps={3}>
			<WalkthroughModalStep>
				<WalkthroughModalContent>Step 1 of 3</WalkthroughModalContent>
				<WalkthroughModalProgress />
			</WalkthroughModalStep>
		</WalkthroughModal>
	);
}
