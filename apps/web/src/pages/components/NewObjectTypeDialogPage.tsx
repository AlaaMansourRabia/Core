import * as React from "react";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {NewObjectTypeDialog} from "@/components/ui/new-object-type-dialog";

function Example() {
	const [open, setOpen] = React.useState(false);
	const [draft, setDraft] = React.useState<string | null>(null);
	return (
		<div className="wwc:space-y-3">
			<Button onClick={() => setOpen(true)}>New object type</Button>
			{draft ? <p className="wwc:text-muted-foreground wwc:text-xs">Draft: {draft}</p> : null}
			<NewObjectTypeDialog
				open={open}
				onOpenChange={setOpen}
				onCreate={(d) => setDraft(JSON.stringify(d).slice(0, 140))}
			/>
		</div>
	);
}

export function NewObjectTypeDialogPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">NewObjectTypeDialog</h1>
					<CopyButton
						value="NewObjectTypeDialog"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Four-step authoring wizard for an ontology object type: metadata, datasources, properties, review.
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
