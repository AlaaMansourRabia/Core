import * as React from "react";

import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {WizardDialog} from "@/components/ui/wizard-dialog";

const LABEL = "wwc:text-xs wwc:font-semibold wwc:tracking-wide wwc:text-muted-foreground wwc:uppercase";

/** The four-step shape the ontology wizards use. */
function ObjectTypeExample() {
	const [open, setOpen] = React.useState(false);
	const [displayName, setDisplayName] = React.useState("");
	const [apiName, setApiName] = React.useState("");
	const [description, setDescription] = React.useState("");
	const [properties, setProperties] = React.useState<string[]>([]);

	const metadataValid = displayName.trim().length > 0 && apiName.trim().length > 0;

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
									<span className={LABEL}>Display name</span>
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
									<span className={LABEL}>API name</span>
									<Input
										value={apiName}
										placeholder="work_permit"
										onChange={(e) => setApiName(e.target.value)}
										aria-invalid={attempted && apiName.trim().length === 0}
										className={attempted && apiName.trim().length === 0 ? "wwc:border-destructive" : undefined}
									/>
								</div>
								<div className="wwc:space-y-1.5">
									<span className={LABEL}>Description</span>
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
									<p className="wwc:text-muted-foreground wwc:text-xs">
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
				onReset={() => {
					setDisplayName("");
					setApiName("");
					setDescription("");
					setProperties([]);
				}}
			/>
		</>
	);
}

/** A staged operation rather than a form: step one computes, step two applies. */
function StagedOperationExample() {
	const [open, setOpen] = React.useState(false);
	const [target, setTarget] = React.useState("");

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
								<span className={LABEL}>Target project</span>
								<Input
									value={target}
									placeholder="Falcon Heights Medical Tower"
									onChange={(e) => setTarget(e.target.value)}
									aria-invalid={attempted && target.trim().length === 0}
									className={attempted && target.trim().length === 0 ? "wwc:border-destructive" : undefined}
								/>
								<p className="wwc:text-muted-foreground wwc:text-xs">
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
}

export function WizardDialogPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">WizardDialog</h1>
					<CopyButton
						value="WizardDialog"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					The multi-step half of the authoring contract. Next is always pressable; pressing it on an unsatisfied step
					reveals that step's errors rather than sitting greyed out.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Default</CardTitle>
					<CardDescription>
						Press <b>Next →</b> on the empty first step to watch the wizard hold position and light up the field — then
						satisfy it, go forward, and come <b>← Back</b> to see the attempted flag has cleared.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ObjectTypeExample />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Staged operation</CardTitle>
					<CardDescription>
						<code>nextLabel</code> renames the button for one step only — the same validity gate still runs.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<StagedOperationExample />
				</CardContent>
			</Card>
		</div>
	);
}
