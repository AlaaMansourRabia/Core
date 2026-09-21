import * as React from "react";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {NewInterfaceDialog} from "@/components/ui/new-interface-dialog";

function Example() {
	const [open, setOpen] = React.useState(false);
	const [draft, setDraft] = React.useState<string | null>(null);
	return (
		<div className="wwc:space-y-3">
			<Button onClick={() => setOpen(true)}>New interface</Button>
			{draft ? <p className="wwc:text-muted-foreground wwc:text-xs">Draft: {draft}</p> : null}
			<NewInterfaceDialog
				open={open}
				onOpenChange={setOpen}
				onCreate={(d) => setDraft(JSON.stringify(d).slice(0, 140))}
			/>
		</div>
	);
}

export function NewInterfaceDialogPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">NewInterfaceDialog</h1>
					<CopyButton
						value="NewInterfaceDialog"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Author a shared ontology interface: name, description, status and what it extends.
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
