import {seedProcesses} from "@wakecap/core-ui/pages/wc3-process-views";
import * as React from "react";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {CreateProcessDialog} from "@/components/ui/create-process-dialog";

function Example() {
	const [open, setOpen] = React.useState(false);
	const [processes] = React.useState(() => seedProcesses());
	const [created, setCreated] = React.useState<string | null>(null);
	return (
		<div className="wwc:space-y-3">
			<Button onClick={() => setOpen(true)}>Create process</Button>
			{created ? <p className="wwc:text-muted-foreground wwc:text-xs">Last draft: {created}</p> : null}
			<CreateProcessDialog
				open={open}
				onOpenChange={setOpen}
				processes={processes}
				onCreate={(draft) => setCreated(`${draft.name} \u2192 ${draft.objectTypeId}.${draft.statusProp}`)}
			/>
		</div>
	);
}

export function CreateProcessDialogPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">CreateProcessDialog</h1>
					<CopyButton
						value="CreateProcessDialog"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">Bind a new state machine to an ontology object type.</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Default</CardTitle>
					<CardDescription>
						Press <b>Create process</b> on the empty form to see the never-disable rule. Then pick <b>Work Permit</b>—
						it is already claimed by the shipped Digital Work Permit process, so the shared-tokens caveat appears and
						the status property pre-fills by heuristic.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Example />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>It hands back a draft</CardTitle>
					<CardDescription>
						<code>onCreate</code> receives a draft, not a record. The caller builds the record with
						<code> createProcess()</code>, which is what lets a host drill straight into the new process without this
						dialog knowing how the host stores anything.
					</CardDescription>
				</CardHeader>
			</Card>
		</div>
	);
}
