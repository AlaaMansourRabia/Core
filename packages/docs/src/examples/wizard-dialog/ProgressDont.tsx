/**
 * Avoid hiding progress from users (always use clear step labels).
 */
import type {WizardStep} from "@corensystem/coren-ui/wizard-dialog";

import {Button} from "@corensystem/coren-ui/button";
import {WizardDialog} from "@corensystem/coren-ui/wizard-dialog";
import {useState} from "react";

const steps: WizardStep[] = [
	{label: "???", content: <p>Where am I?</p>},
	{label: "???", content: <p>How many steps left?</p>},
];

export function ProgressDont() {
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
