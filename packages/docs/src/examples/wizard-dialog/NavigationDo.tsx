/**
 * Allow going back to previous steps.
 */
import {WizardDialog, WizardDialogTrigger, WizardDialogContent, WizardStep, WizardNavigation} from "@corensystem/coren-ui/wizard-dialog";
import {Button} from "@corensystem/coren-ui/button";

export function NavigationDo() {
	return (
		<WizardDialog>
			<WizardDialogTrigger asChild>
				<Button>Start</Button>
			</WizardDialogTrigger>
			<WizardDialogContent>
				<WizardStep title="Step 1">Content 1</WizardStep>
				<WizardStep title="Step 2">Content 2</WizardStep>
				<WizardNavigation showBack showNext />
			</WizardDialogContent>
		</WizardDialog>
	);
}
