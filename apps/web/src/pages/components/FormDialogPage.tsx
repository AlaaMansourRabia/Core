import * as React from "react";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Combobox} from "@/components/ui/combobox";
import {CopyButton} from "@/components/ui/copy-button";
import {FormDialog, FormDialogField, FormDialogNote, FormDialogRow} from "@/components/ui/form-dialog";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";

const OBJECT_TYPES = [
	{value: "ot_permit", label: "Work Permit"},
	{value: "ot_observation", label: "Safety Observation"},
	{value: "ot_worker", label: "Worker"},
];

const STATUS_PROPS: Record<string, {value: string; label: string}[]> = {
	ot_permit: [
		{value: "permit_status", label: "Status (permit_status)"},
		{value: "permit_stage", label: "Stage (permit_stage)"},
	],
	ot_observation: [{value: "observation_status", label: "Status (observation_status)"}],
	ot_worker: [{value: "employment_state", label: "Employment state (employment_state)"}],
};

/** The Studio → Processes → Create process form this widget was extracted from. */
function CreateProcessExample() {
	const [open, setOpen] = React.useState(false);
	const [name, setName] = React.useState("");
	const [objectTypeId, setObjectTypeId] = React.useState("");
	const [statusProp, setStatusProp] = React.useState("");

	const nameValid = name.trim().length > 0;
	const valid = nameValid && objectTypeId.length > 0 && statusProp.length > 0;

	return (
		<>
			<Button onClick={() => setOpen(true)}>Create process</Button>
			<FormDialog
				open={open}
				onOpenChange={setOpen}
				title="Create process"
				width={560}
				valid={valid}
				hint="Name it, bind it to an object type, then create."
				error={nameValid ? "Pick a backing object type and its status property." : "Name required."}
				submitLabel="Create process"
				onSubmit={() => {}}
				onReset={() => {
					setName("");
					setObjectTypeId("");
					setStatusProp("");
				}}
			>
				<FormDialogField label="Name" invalid={!nameValid}>
					{({invalid}) => (
						<Input
							value={name}
							placeholder="e.g. Lifting plan approval"
							onChange={(e) => setName(e.target.value)}
							aria-invalid={invalid}
							className={invalid ? "wwc:border-destructive" : undefined}
						/>
					)}
				</FormDialogField>
				<FormDialogRow>
					<FormDialogField
						label="Backing object type"
						invalid={objectTypeId.length === 0}
						hint="Its rows are the tokens of this process."
					>
						{({invalid}) => (
							<Combobox
								options={OBJECT_TYPES}
								value={objectTypeId}
								onValueChange={(next) => {
									setObjectTypeId(next);
									setStatusProp(STATUS_PROPS[next]?.[0]?.value ?? "");
								}}
								placeholder="Pick an object type…"
								className={invalid ? "wwc:w-full wwc:border-destructive" : "wwc:w-full"}
							/>
						)}
					</FormDialogField>
					<FormDialogField
						label="Status property"
						invalid={statusProp.length === 0}
						hint="Holds the current state value on a row."
					>
						{({invalid}) => (
							<Combobox
								options={STATUS_PROPS[objectTypeId] ?? []}
								value={statusProp}
								onValueChange={setStatusProp}
								placeholder={objectTypeId ? "Pick a property…" : "Pick an object type first"}
								disabled={!objectTypeId}
								className={invalid ? "wwc:w-full wwc:border-destructive" : "wwc:w-full"}
							/>
						)}
					</FormDialogField>
				</FormDialogRow>
				<FormDialogNote>
					It opens on a two-state graph — an initial <b>Draft</b> and a terminal <b>Closed</b> — with no transitions
					yet.
				</FormDialogNote>
			</FormDialog>
		</>
	);
}

/** The smallest useful form: one required field, one optional. */
function SingleFieldExample() {
	const [open, setOpen] = React.useState(false);
	const [name, setName] = React.useState("");
	const [desc, setDesc] = React.useState("");
	const valid = name.trim().length > 0;

	return (
		<>
			<Button onClick={() => setOpen(true)}>New pipeline</Button>
			<FormDialog
				open={open}
				onOpenChange={setOpen}
				title="New pipeline"
				valid={valid}
				hint="Name it, then create."
				error="Name required."
				submitLabel="Create pipeline"
				onSubmit={() => {}}
				onReset={() => {
					setName("");
					setDesc("");
				}}
			>
				<FormDialogField label="Name" invalid={!valid}>
					{({invalid}) => (
						<Input
							value={name}
							placeholder="e.g. Site photo intake — captures → observations"
							onChange={(e) => setName(e.target.value)}
							aria-invalid={invalid}
							className={invalid ? "wwc:border-destructive" : undefined}
						/>
					)}
				</FormDialogField>
				<FormDialogField label="Description">
					<Textarea rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} />
				</FormDialogField>
			</FormDialog>
		</>
	);
}

/** A destructive edit reuses the same shell — only `submitVariant` changes. */
function DestructiveExample() {
	const [open, setOpen] = React.useState(false);
	const [confirmation, setConfirmation] = React.useState("");
	const valid = confirmation === "Digital Work Permit";

	return (
		<>
			<Button variant="destructive" onClick={() => setOpen(true)}>
				Delete process
			</Button>
			<FormDialog
				open={open}
				onOpenChange={setOpen}
				title="Delete process"
				description="This removes the state machine. The backing object type and its rows are untouched."
				valid={valid}
				hint="Type the process name to confirm."
				error="The name does not match — nothing was deleted."
				submitLabel="Delete process"
				submitVariant="destructive"
				onSubmit={() => {}}
				onReset={() => setConfirmation("")}
			>
				<FormDialogField label="Process name" invalid={!valid}>
					{({invalid}) => (
						<Input
							value={confirmation}
							placeholder="Digital Work Permit"
							onChange={(e) => setConfirmation(e.target.value)}
							aria-invalid={invalid}
							className={invalid ? "wwc:border-destructive" : undefined}
						/>
					)}
				</FormDialogField>
			</FormDialog>
		</>
	);
}

export function FormDialogPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">FormDialog</h1>
					<CopyButton
						value="FormDialog"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Single-step create or edit modal carrying the house authoring contract: a submit that is never disabled,
					per-field errors that appear only once a submit has been refused, and a reset that runs on close as well as on
					success.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Default</CardTitle>
					<CardDescription>
						Press <b>Create process</b> on the empty form to see the never-disable rule: the footer swaps to the
						specific error and the offending fields light up, all at once and not before.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<CreateProcessExample />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Single field</CardTitle>
					<CardDescription>
						The footer's left slot is guidance, not decoration — say what is missing, not merely that something is.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<SingleFieldExample />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Destructive</CardTitle>
					<CardDescription>
						Only <code>submitVariant</code> changes — there is no separate confirm-flavoured dialog to keep in sync.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<DestructiveExample />
				</CardContent>
			</Card>
		</div>
	);
}
