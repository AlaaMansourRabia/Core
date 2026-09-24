/**
 * Wizard with progress indicator.
 */
import {WizardDialog, WizardDialogTrigger, WizardDialogContent, WizardStep, WizardProgress} from "@corensystem/coren-ui/wizard-dialog";
import {Button} from "@corensystem/coren-ui/button";

export function WithProgress() {
	return (
		<WizardDialog>
			<WizardDialogTrigger asChild>
				<Button>Setup Account</Button>
			</WizardDialogTrigger>
			<WizardDialogContent>
				<WizardProgress />
				<WizardStep title="Account">
					<p>Enter your account details.</p>
				</WizardStep>
				<WizardStep title="Profile">
					<p>Complete your profile.</p>
				</WizardStep>
				<WizardStep title="Preferences">
					<p>Set your preferences.</p>
				</WizardStep>
			</WizardDialogContent>
		</WizardDialog>
	);
}
