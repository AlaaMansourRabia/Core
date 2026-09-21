import * as React from "react";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CopyButton} from "@/components/ui/copy-button";
import {NewLinkTypeDialog} from "@/components/ui/new-link-type-dialog";

const OBJECT_TYPES = [
	{id: "ot_permit", label: "Work Permit"},
	{id: "ot_worker", label: "Worker"},
	{id: "ot_site", label: "Site"},
];

const PRIMARY_KEYS: Record<string, string> = {ot_permit: "permit_id", ot_worker: "worker_id", ot_site: "site_id"};
const FK_CANDIDATES: Record<string, string[]> = {
	ot_permit: ["issued_to_worker_id", "site_id"],
	ot_worker: ["home_site_id"],
	ot_site: [],
};

function Example() {
	const [open, setOpen] = React.useState(false);
	const [draft, setDraft] = React.useState<string | null>(null);
	return (
		<div className="wwc:space-y-3">
			<Button onClick={() => setOpen(true)}>New link type</Button>
			{draft ? <p className="wwc:text-muted-foreground wwc:text-xs">Draft: {draft}</p> : null}
			<NewLinkTypeDialog
				open={open}
				onOpenChange={setOpen}
				objectTypes={OBJECT_TYPES}
				fkPropertiesFor={(id) => FK_CANDIDATES[id] ?? []}
				targetPrimaryKeyFor={(id) => PRIMARY_KEYS[id] ?? ""}
				onCreate={(d) => setDraft(JSON.stringify(d).slice(0, 140))}
			/>
		</div>
	);
}

export function NewLinkTypeDialogPage() {
	return (
		<div className="wwc:space-y-8">
			<div>
				<div className="wwc:group wwc:flex wwc:items-center wwc:gap-3">
					<h1 className="wwc:text-3xl wwc:font-bold">NewLinkTypeDialog</h1>
					<CopyButton
						value="NewLinkTypeDialog"
						className="wwc:opacity-0 wwc:group-hover:opacity-100 wwc:focus-visible:opacity-100"
					/>
				</div>
				<p className="wwc:text-muted-foreground wwc:mt-2">
					Author a link between two object types, including the foreign key that actually backs it.
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
