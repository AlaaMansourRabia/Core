/**
 * Allow canceling with confirmation.
 */
import {WizardDialog, WizardDialogTrigger, WizardDialogContent, WizardStep} from "@corensystem/coren-ui/wizard-dialog";
import {Button} from "@corensystem/coren-ui/button";

export function CancelDo() {
	return (
		<WizardDialog confirmOnCancel>
			<WizardDialogTrigger asChild>
				<Button>Start</Button>
			</WizardDialogTrigger>
			<WizardDialogContent>
				<WizardStep title="Step 1">
					<p>Your progress will be saved.</p>
				</WizardStep>
			</WizardDialogContent>
		</WizardDialog>
	);
}
