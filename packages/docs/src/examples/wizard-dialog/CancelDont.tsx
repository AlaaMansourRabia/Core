import {Button} from "@corensystem/coren-ui/button";
/**
 * Avoid losing progress without warning.
 */
import {WizardDialog, WizardDialogTrigger, WizardDialogContent, WizardStep} from "@corensystem/coren-ui/wizard-dialog";

export function CancelDont() {
	return (
		<WizardDialog confirmOnCancel={false}>
			<WizardDialogTrigger asChild>
				<Button>Start</Button>
			</WizardDialogTrigger>
			<WizardDialogContent>
				<WizardStep title="Step 1">
					<p>Closing loses all progress!</p>
				</WizardStep>
			</WizardDialogContent>
		</WizardDialog>
	);
}
