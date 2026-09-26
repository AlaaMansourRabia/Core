import {Button} from "@corensystem/coren-ui/button";
/**
 * Basic multi-step wizard dialog.
 */
import {WizardDialog, WizardDialogTrigger, WizardDialogContent, WizardStep} from "@corensystem/coren-ui/wizard-dialog";

export function Default() {
	return (
		<WizardDialog>
			<WizardDialogTrigger asChild>
				<Button>Start Wizard</Button>
			</WizardDialogTrigger>
			<WizardDialogContent>
				<WizardStep title="Step 1">
					<p>Welcome to the setup wizard.</p>
				</WizardStep>
				<WizardStep title="Step 2">
					<p>Configure your settings.</p>
				</WizardStep>
				<WizardStep title="Step 3">
					<p>Review and confirm.</p>
				</WizardStep>
			</WizardDialogContent>
		</WizardDialog>
	);
}
