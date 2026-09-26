/**
 * Show clear progress indication with step labels.
 */
import type {WizardStep} from "@corensystem/coren-ui/wizard-dialog";

import {Button} from "@corensystem/coren-ui/button";
import {WizardDialog} from "@corensystem/coren-ui/wizard-dialog";
import {useState} from "react";

const steps: WizardStep[] = [
	{label: "Account", content: <p>Step 1 content</p>},
	{label: "Profile", content: <p>Step 2 content</p>},
	{label: "Done", content: <p>Step 3 content</p>},
];

export function ProgressDo() {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Button onClick={() => setOpen(true)}>Start</Button>
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
