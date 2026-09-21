import * as React from "react";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {NewActionTypeDialog} from "@/components/ui/new-action-type-dialog";

const ACTION_OBJECT_TYPES = [
	{id: "ot_permit", label: "Work Permit"},
	{id: "ot_worker", label: "Worker"},
	{id: "ot_site", label: "Site"},
];

const LINK_TYPES = [
	{id: "lt_permit_worker", label: "Permit → Worker"},
	{id: "lt_permit_site", label: "Permit → Site"},
];

function Example() {
	const [open, setOpen] = React.useState(false);
	const [draft, setDraft] = React.useState<string | null>(null);
	return (
		<div className="wwc:space-y-3">
			<Button onClick={() => setOpen(true)}>New action type</Button>
			{draft ? <p className="wwc:text-muted-foreground wwc:text-xs">Draft: {draft}</p> : null}
			<NewActionTypeDialog
				open={open}
				onOpenChange={setOpen}
				objectTypes={ACTION_OBJECT_TYPES}
				linkTypes={LINK_TYPES}
				onCreate={(d) => setDraft(JSON.stringify(d).slice(0, 140))}
			/>
		</div>
	);
}

export function NewActionTypeDialogPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">NewActionTypeDialog</h1>
					<CopyButton
						value="NewActionTypeDialog"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Four-step authoring wizard for an ontology action type: metadata, parameters, rules, review.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Default</CardTitle>
					<CardDescription>
						It assembles a draft and hands it back — the host mints the id and decides where it lands.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Example />
				</CardContent>
			</Card>
		</div>
	);
}
