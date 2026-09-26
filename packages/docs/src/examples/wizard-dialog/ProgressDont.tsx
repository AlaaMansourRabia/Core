import {Button} from "@corensystem/coren-ui/button";
/**
 * Avoid hiding progress from users.
 */
import {WizardDialog, WizardDialogTrigger, WizardDialogContent, WizardStep} from "@corensystem/coren-ui/wizard-dialog";

export function ProgressDont() {
	return (
		<WizardDialog>
			<WizardDialogTrigger asChild>
				<Button>Start</Button>
			</WizardDialogTrigger>
			<WizardDialogContent>
				{/* No progress indicator */}
				<WizardStep title="???">Where am I?</WizardStep>
				<WizardStep title="???">How many steps left?</WizardStep>
			</WizardDialogContent>
		</WizardDialog>
	);
}
