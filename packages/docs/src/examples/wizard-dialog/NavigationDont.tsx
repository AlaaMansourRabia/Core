import {Button} from "@corensystem/coren-ui/button";
/**
 * Avoid forcing users forward only.
 */
import {
	WizardDialog,
	WizardDialogTrigger,
	WizardDialogContent,
	WizardStep,
	WizardNavigation,
} from "@corensystem/coren-ui/wizard-dialog";

export function NavigationDont() {
	return (
		<WizardDialog>
			<WizardDialogTrigger asChild>
				<Button>Start</Button>
			</WizardDialogTrigger>
			<WizardDialogContent>
				<WizardStep title="Step 1">Content 1</WizardStep>
				<WizardStep title="Step 2">Content 2</WizardStep>
				<WizardNavigation showBack={false} showNext />
			</WizardDialogContent>
		</WizardDialog>
	);
}
