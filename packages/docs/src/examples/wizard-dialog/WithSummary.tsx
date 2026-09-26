/**
 * Wizard with review step.
 */
import {WizardDialog, WizardDialogTrigger, WizardDialogContent, WizardStep, WizardSummary} from "@corensystem/coren-ui/wizard-dialog";
import {Button} from "@corensystem/coren-ui/button";

export function WithSummary() {
	return (
		<WizardDialog>
			<WizardDialogTrigger asChild>
				<Button>Configure</Button>
			</WizardDialogTrigger>
			<WizardDialogContent>
				<WizardStep title="Settings">
					<p>Configure your settings.</p>
				</WizardStep>
				<WizardStep title="Review">
					<WizardSummary>
						<p>Review your selections before confirming.</p>
					</WizardSummary>
				</WizardStep>
			</WizardDialogContent>
		</WizardDialog>
	);
}
