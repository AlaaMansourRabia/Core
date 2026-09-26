/**
 * Basic multi-step wizard dialog.
 */
import type {WizardStep} from "@corensystem/coren-ui/wizard-dialog";

import {Button} from "@corensystem/coren-ui/button";
import {WizardDialog} from "@corensystem/coren-ui/wizard-dialog";
import {useState} from "react";

const steps: WizardStep[] = [
	{label: "Welcome", content: <p>Welcome to the setup wizard.</p>},
	{label: "Configure", content: <p>Configure your settings.</p>},
	{label: "Review", content: <p>Review and confirm.</p>},
];

export function Default() {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Button onClick={() => setOpen(true)}>Start Wizard</Button>
			<WizardDialog
				open={open}
				onOpenChange={setOpen}
				title="Setup Wizard"
				steps={steps}
				submitLabel="Submit"
				onSubmit={() => setOpen(false)}
			/>
		</>
	);
}
