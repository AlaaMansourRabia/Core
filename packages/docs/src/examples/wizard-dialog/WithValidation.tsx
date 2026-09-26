/**
 * Wizard with step validation.
 */
import type {WizardStep} from "@corensystem/coren-ui/wizard-dialog";

import {Button} from "@corensystem/coren-ui/button";
import {Input} from "@corensystem/coren-ui/input";
import {Label} from "@corensystem/coren-ui/label";
import {WizardDialog} from "@corensystem/coren-ui/wizard-dialog";
import {useState} from "react";

export function WithValidation() {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");

	const steps: WizardStep[] = [
		{
			label: "Name",
			valid: name.length > 0,
			content: ({attempted}) => (
				<div className="wwc:space-y-2">
					<Label htmlFor="wiz-name">Name</Label>
					<Input id="wiz-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter name" />
					{attempted && !name && <p className="wwc:text-sm wwc:text-destructive">Name is required</p>}
				</div>
			),
		},
		{
			label: "Email",
			valid: email.includes("@"),
			content: ({attempted}) => (
				<div className="wwc:space-y-2">
					<Label htmlFor="wiz-email">Email</Label>
					<Input
						id="wiz-email"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="Enter email"
					/>
					{attempted && !email.includes("@") && (
						<p className="wwc:text-sm wwc:text-destructive">Valid email required</p>
					)}
				</div>
			),
		},
		{label: "Confirm", content: <p>Click Submit to complete.</p>},
	];

	return (
		<>
			<Button onClick={() => setOpen(true)}>Start Validated Wizard</Button>
			<WizardDialog
				open={open}
				onOpenChange={setOpen}
				title="Validated Wizard"
				steps={steps}
				submitLabel="Submit"
				onSubmit={() => setOpen(false)}
			/>
		</>
	);
}
