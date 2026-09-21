import type {Meta, StoryObj} from "storybook/internal/types";

import {Badge} from "@wakecap/core-ui/badge";
import {Button} from "@wakecap/core-ui/button";
import {Input} from "@wakecap/core-ui/input";
import {Textarea} from "@wakecap/core-ui/textarea";
import {WizardDialog} from "@wakecap/core-ui/wizard-dialog";
import {useState} from "react";

const label = "wwc:text-xs wwc:font-semibold wwc:tracking-wide wwc:text-muted-foreground wwc:uppercase";

const meta = {
	title: "Widgets/Authoring/Wizard Dialog",
	component: WizardDialog,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"The multi-step half of the authoring contract — `FormDialog` for anything that does not fit one screen. It carries the same never-disable rule one level up: **Next is always pressable**, and pressing it on an unsatisfied step reveals that step's errors rather than sitting greyed out. `attempted` clears on every step change, forward or back, so an error the user has already moved past does not follow them. A step declares its own `valid`; the wizard owns position, the Stepper rail, the *Step N of M* counter, and which of Back / Next / submit is showing. Only the current step is mounted, so a heavy Review step costs nothing until it is reached.",
			},
		},
	},
} satisfies Meta<typeof WizardDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The four-step shape the ontology wizards use. Press **Next →** on the empty first step to watch
 * the wizard hold position and light up the field instead of advancing — then satisfy it, go
 * forward, and come **← Back** to see `attempted` has cleared.
 */
export const Default: Story = {
	render: () => {
		const [open, setOpen] = useState(false);
		const [displayName, setDisplayName] = useState("");
		const [apiName, setApiName] = useState("");
		const [description, setDescription] = useState("");
		const [properties, setProperties] = useState<string[]>([]);

		const metadataValid = displayName.trim().length > 0 && apiName.trim().length > 0;

		const reset = () => {
			setDisplayName("");
			setApiName("");
			setDescription("");
			setProperties([]);
		};

		return (
			<>
				<Button onClick={() => setOpen(true)}>New object type</Button>
				<WizardDialog
					open={open}
					onOpenChange={setOpen}
					title="New object type"
					steps={[
						{
							label: "Metadata",
							valid: metadataValid,
							content: ({attempted}) => (
								<div className="wwc:grid wwc:gap-4">
									<div className="wwc:space-y-1.5">
										<span className={label}>Display name</span>
										<Input
											value={displayName}
											placeholder="e.g. Work Permit"
											onChange={(e) => {
												setDisplayName(e.target.value);
												setApiName(e.target.value.trim().toLowerCase().replace(/\s+/g, "_"));
											}}
											aria-invalid={attempted && displayName.trim().length === 0}
											className={attempted && displayName.trim().length === 0 ? "wwc:border-destructive" : undefined}
										/>
									</div>
									<div className="wwc:space-y-1.5">
										<span className={label}>API name</span>
										<Input
											value={apiName}
											placeholder="work_permit"
											onChange={(e) => setApiName(e.target.value)}
											aria-invalid={attempted && apiName.trim().length === 0}
											className={attempted && apiName.trim().length === 0 ? "wwc:border-destructive" : undefined}
										/>
									</div>
									<div className="wwc:space-y-1.5">
										<span className={label}>Description</span>
										<Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
									</div>
								</div>
							),
						},
						{
							label: "Properties",
							valid: properties.length > 0,
							content: ({attempted}) => (
								<div className="wwc:grid wwc:gap-4">
									<div className="wwc:flex wwc:flex-wrap wwc:gap-2">
										{["permit_id", "status", "issued_at", "site"].map((p) => (
											<Button
												key={p}
												size="sm"
												variant={properties.includes(p) ? "default" : "outline"}
												onClick={() =>
													setProperties((current) =>
														current.includes(p) ? current.filter((x) => x !== p) : [...current, p],
													)
												}
											>
												{p}
											</Button>
										))}
									</div>
									{attempted && properties.length === 0 ? (
										<p className="wwc:text-xs wwc:text-destructive">Pick at least one property.</p>
									) : (
										<p className="wwc:text-xs wwc:text-muted-foreground">
											Toggle the properties this object type declares.
										</p>
									)}
								</div>
							),
						},
						{
							label: "Review",
							content: (
								<dl className="wwc:grid wwc:grid-cols-[10rem_1fr] wwc:gap-y-2 wwc:text-sm">
									<dt className="wwc:text-muted-foreground">Display name</dt>
									<dd>{displayName || "—"}</dd>
									<dt className="wwc:text-muted-foreground">API name</dt>
									<dd className="wwc:font-mono wwc:text-xs">{apiName || "—"}</dd>
									<dt className="wwc:text-muted-foreground">Description</dt>
									<dd>{description || "—"}</dd>
									<dt className="wwc:text-muted-foreground">Properties</dt>
									<dd className="wwc:flex wwc:flex-wrap wwc:gap-1">
										{properties.length === 0
											? "—"
											: properties.map((p) => (
													<Badge key={p} variant="secondary" className="wwc:font-mono wwc:font-normal">
														{p}
													</Badge>
												))}
									</dd>
								</dl>
							),
						},
					]}
					submitLabel="Create object type"
					onSubmit={() => {}}
					onReset={reset}
				/>
			</>
		);
	},
};

/**
 * A staged operation rather than a form: step one computes, step two applies. `nextLabel` renames
 * the button for that step only — the same validity gate still runs.
 */
export const StagedOperation: Story = {
	render: () => {
		const [open, setOpen] = useState(false);
		const [target, setTarget] = useState("");

		return (
			<>
				<Button onClick={() => setOpen(true)}>Install product</Button>
				<WizardDialog
					open={open}
					onOpenChange={setOpen}
					width={640}
					title="Install product"
					steps={[
						{
							label: "Draft",
							valid: target.trim().length > 0,
							nextLabel: "Plan",
							content: ({attempted}) => (
								<div className="wwc:space-y-1.5">
									<span className={label}>Target project</span>
									<Input
										value={target}
										placeholder="Falcon Heights Medical Tower"
										onChange={(e) => setTarget(e.target.value)}
										aria-invalid={attempted && target.trim().length === 0}
										className={attempted && target.trim().length === 0 ? "wwc:border-destructive" : undefined}
									/>
									<p className="wwc:text-xs wwc:text-muted-foreground">
										Planning is read-only — nothing is written until Apply.
									</p>
								</div>
							),
						},
						{
							label: "Plan",
							content: (
								<div className="wwc:space-y-3 wwc:text-sm">
									<p className="wwc:text-muted-foreground">
										Installing into <b className="wwc:text-foreground">{target || "—"}</b> would:
									</p>
									<ul className="wwc:list-disc wwc:space-y-1 wwc:pl-5">
										<li>add 4 object types</li>
										<li>add 2 link types</li>
										<li>skip 1 primitive already present</li>
									</ul>
								</div>
							),
						},
					]}
					submitLabel="Apply install"
					onSubmit={() => {}}
					onReset={() => setTarget("")}
				/>
			</>
		);
	},
};
