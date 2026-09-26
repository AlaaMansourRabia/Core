/**
 * Wizard dialog with progress indicator.
 */
import type {WizardStep} from "@corensystem/coren-ui/wizard-dialog";

import {Button} from "@corensystem/coren-ui/button";
import {WizardDialog} from "@corensystem/coren-ui/wizard-dialog";
import {useState} from "react";

const steps: WizardStep[] = [
	{label: "Account", content: <p>Set up your account details.</p>},
	{label: "Profile", content: <p>Complete your profile information.</p>},
	{label: "Preferences", content: <p>Configure your preferences.</p>},
	{label: "Confirm", content: <p>Review and confirm your setup.</p>},
];

export function WithProgress() {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Button onClick={() => setOpen(true)}>Open Wizard</Button>
			<WizardDialog
				open={open}
				onOpenChange={setOpen}
				title="Account Setup"
				steps={steps}
				submitLabel="Submit"
				onSubmit={() => setOpen(false)}
			/>
		</>
	);
}
