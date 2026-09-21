import type {Meta, StoryObj} from "storybook/internal/types";

import {Button} from "@wakecap/core-ui/button";
import {Combobox} from "@wakecap/core-ui/combobox";
import {FormDialog, FormDialogField, FormDialogNote, FormDialogRow} from "@wakecap/core-ui/form-dialog";
import {Input} from "@wakecap/core-ui/input";
import {Textarea} from "@wakecap/core-ui/textarea";
import {ToggleGroup, ToggleGroupItem} from "@wakecap/core-ui/toggle-group";
import {useState} from "react";

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

const meta = {
	title: "Widgets/Authoring/Form Dialog",
	component: FormDialog,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"Single-step create or edit modal carrying the house authoring contract in one place. Three rules it owns so no call site re-derives them: **submit is never disabled** — a refused press swallows the click, flips an internal `attempted` flag and reveals the errors; **validity and error display are separate** — a field passes plain `invalid`, and the dialog decides the timing, so an untouched form is never red however invalid it is; and **reset runs on close as well as on success**, so re-opening never shows the last attempt's half-typed values. The footer's left slot is guidance, not decoration: it holds `hint` until a submit is refused, then swaps to `error`, putting the explanation where the user is already looking when the button appears to do nothing.",
			},
		},
	},
} satisfies Meta<typeof FormDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The real Studio → Processes → Create process form, which this widget was extracted from.
 * Press **Create process** on the empty form to see the never-disable rule: the footer swaps to the
 * specific error and the offending fields light up, all at once and not before.
 */
export const Default: Story = {
	render: () => {
		const [open, setOpen] = useState(false);
		const [name, setName] = useState("");
		const [objectTypeId, setObjectTypeId] = useState("");
		const [statusProp, setStatusProp] = useState("");
		const [icon, setIcon] = useState("workflow");

		const nameValid = name.trim().length > 0;
		const valid = nameValid && objectTypeId.length > 0 && statusProp.length > 0;

		const reset = () => {
			setName("");
			setObjectTypeId("");
			setStatusProp("");
			setIcon("workflow");
		};

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
					onReset={reset}
				>
					<FormDialogField label="Name" invalid={!nameValid}>
						{({invalid, id}) => (
							<Input
								id={id}
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
							{({invalid, id, describedBy}) => (
								<Combobox
									id={id}
									aria-describedby={describedBy}
									aria-invalid={invalid}
									options={OBJECT_TYPES}
									value={objectTypeId}
									onValueChange={(next) => {
										setObjectTypeId(next);
										setStatusProp(STATUS_PROPS[next]?.[0]?.value ?? "");
									}}
									placeholder="Pick an object type…"
									searchPlaceholder="Search object types…"
									className={invalid ? "wwc:w-full wwc:border-destructive" : "wwc:w-full"}
								/>
							)}
						</FormDialogField>
						<FormDialogField
							label="Status property"
							invalid={statusProp.length === 0}
							hint="Holds the current state value on a row."
						>
							{({invalid, id, describedBy}) => (
								<Combobox
									id={id}
									aria-describedby={describedBy}
									aria-invalid={invalid}
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

					<FormDialogField label="Icon" className="wwc:space-y-2">
						{({labelId}) => (
							<ToggleGroup
								type="single"
								value={icon}
								// A group is not a labelable control, so the caption names it by id, not `htmlFor`.
								aria-labelledby={labelId}
								onValueChange={(next) => {
									if (next) setIcon(next);
								}}
								variant="outline"
								size="sm"
								className="wwc:flex-wrap wwc:justify-start wwc:gap-2"
							>
								{["workflow", "route", "git-branch", "list-checks"].map((value) => (
									<ToggleGroupItem key={value} value={value} aria-label={value}>
										{value}
									</ToggleGroupItem>
								))}
							</ToggleGroup>
						)}
					</FormDialogField>

					<FormDialogNote>
						It opens on a two-state graph — an initial <b>Draft</b> and a terminal <b>Closed</b> — with no transitions
						yet, so the lint list will ask for the first one.
					</FormDialogNote>
				</FormDialog>
			</>
		);
	},
};

/**
 * The smallest useful form: one required field. `hint` and `error` are the whole footer contract —
 * say what is missing, not merely that something is.
 */
export const SingleField: Story = {
	render: () => {
		const [open, setOpen] = useState(false);
		const [name, setName] = useState("");
		const [desc, setDesc] = useState("");
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
						{({invalid, id}) => (
							<Input
								id={id}
								value={name}
								placeholder="e.g. Site photo intake — captures → observations"
								onChange={(e) => setName(e.target.value)}
								aria-invalid={invalid}
								className={invalid ? "wwc:border-destructive" : undefined}
							/>
						)}
					</FormDialogField>
					<FormDialogField label="Description">
						{({id}) => <Textarea id={id} rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} />}
					</FormDialogField>
				</FormDialog>
			</>
		);
	},
};

/**
 * A destructive edit reuses the same shell — only `submitVariant` changes. There is no separate
 * confirm-flavoured dialog to keep in sync.
 */
export const Destructive: Story = {
	render: () => {
		const [open, setOpen] = useState(false);
		const [confirmation, setConfirmation] = useState("");
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
	},
};
