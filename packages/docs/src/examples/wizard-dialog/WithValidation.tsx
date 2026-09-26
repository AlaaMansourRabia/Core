import {Button} from "@corensystem/coren-ui/button";
import {Input} from "@corensystem/coren-ui/input";
import {Label} from "@corensystem/coren-ui/label";
/**
 * Wizard with step validation.
 */
import {WizardDialog, WizardDialogTrigger, WizardDialogContent, WizardStep} from "@corensystem/coren-ui/wizard-dialog";

export function WithValidation() {
	return (
		<WizardDialog>
			<WizardDialogTrigger asChild>
				<Button>Create Project</Button>
			</WizardDialogTrigger>
			<WizardDialogContent>
				<WizardStep title="Name" validateOnNext>
					<div className="wwc:space-y-2">
						<Label htmlFor="name">Project Name</Label>
						<Input id="name" required placeholder="Enter project name" />
					</div>
				</WizardStep>
				<WizardStep title="Details">
					<p>Add project details.</p>
				</WizardStep>
			</WizardDialogContent>
		</WizardDialog>
	);
}
