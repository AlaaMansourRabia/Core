/**
 * Allow going back to previous steps.
 */
import type {WizardStep} from "@corensystem/coren-ui/wizard-dialog";

import {Button} from "@corensystem/coren-ui/button";
import {WizardDialog} from "@corensystem/coren-ui/wizard-dialog";
import {useState} from "react";

const steps: WizardStep[] = [
	{label: "Step 1", content: <p>Content for step 1</p>},
	{label: "Step 2", content: <p>Content for step 2</p>},
];

export function NavigationDo() {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Button onClick={() => setOpen(true)}>Start</Button>
			<WizardDialog
				open={open}
				onOpenChange={setOpen}
				title="Wizard"
				steps={steps}
				submitLabel="Submit"
				onSubmit={() => setOpen(false)}
			/>
		</>
	);
}
