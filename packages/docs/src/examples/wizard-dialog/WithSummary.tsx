/**
 * Wizard with final summary step.
 */
import type {WizardStep} from "@corensystem/coren-ui/wizard-dialog";

import {Button} from "@corensystem/coren-ui/button";
import {WizardDialog} from "@corensystem/coren-ui/wizard-dialog";
import {useState} from "react";

const steps: WizardStep[] = [
	{label: "Details", content: <p>Enter your details.</p>},
	{label: "Options", content: <p>Select your options.</p>},
	{
		label: "Summary",
		content: (
			<div>
				<h4 className="wwc:font-medium">Summary</h4>
				<p>Review your selections before completing.</p>
			</div>
		),
	},
];

export function WithSummary() {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Button onClick={() => setOpen(true)}>Open Wizard</Button>
			<WizardDialog
				open={open}
				onOpenChange={setOpen}
				title="Configuration Wizard"
				steps={steps}
				submitLabel="Submit"
				onSubmit={() => setOpen(false)}
			/>
		</>
	);
}
