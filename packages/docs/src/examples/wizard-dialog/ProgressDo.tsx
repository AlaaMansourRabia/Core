import {Button} from "@corensystem/coren-ui/button";
/**
 * Show clear progress indication.
 */
import {
	WizardDialog,
	WizardDialogTrigger,
	WizardDialogContent,
	WizardStep,
	WizardProgress,
} from "@corensystem/coren-ui/wizard-dialog";

export function ProgressDo() {
	return (
		<WizardDialog>
			<WizardDialogTrigger asChild>
				<Button>Start</Button>
			</WizardDialogTrigger>
			<WizardDialogContent>
				<WizardProgress showStepNumber showLabel />
				<WizardStep title="Account">Step 1 content</WizardStep>
				<WizardStep title="Profile">Step 2 content</WizardStep>
				<WizardStep title="Done">Step 3 content</WizardStep>
			</WizardDialogContent>
		</WizardDialog>
	);
}
