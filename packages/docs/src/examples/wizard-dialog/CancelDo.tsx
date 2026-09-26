/**
 * Allow canceling with confirmation.
 */
import type {WizardStep} from "@corensystem/coren-ui/wizard-dialog";

import {Button} from "@corensystem/coren-ui/button";
import {WizardDialog} from "@corensystem/coren-ui/wizard-dialog";
import {useState} from "react";

const steps: WizardStep[] = [{label: "Step 1", content: <p>Your progress will be saved.</p>}];

export function CancelDo() {
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
