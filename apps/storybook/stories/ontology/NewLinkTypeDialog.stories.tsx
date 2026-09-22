import type {Meta, StoryObj} from "storybook/internal/types";

import {Button} from "@corensystem/core-ui/button";
import {NewLinkTypeDialog} from "@corensystem/core-ui/new-link-type-dialog";
import {useState} from "react";

const OBJECT_TYPES = [
	{id: "ot_permit", label: "Work Permit"},
	{id: "ot_worker", label: "Worker"},
	{id: "ot_site", label: "Site"},
];

const PRIMARY_KEYS: Record<string, string> = {
	ot_permit: "permit_id",
	ot_worker: "worker_id",
	ot_site: "site_id",
};

const FK_CANDIDATES: Record<string, string[]> = {
	ot_permit: ["issued_to_worker_id", "site_id"],
	ot_worker: ["home_site_id"],
	ot_site: [],
};

const meta = {
	title: "Widgets/Ontology/New Link Type Dialog",
	component: NewLinkTypeDialog,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"Author a link between two object types. What separates it from a form of two selects is that it asks for the **foreign key that actually backs the link** and shows the target primary key beside it, so the relationship is declared rather than implied.",
			},
		},
	},
} satisfies Meta<typeof NewLinkTypeDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Assembles a draft and hands it back; the host mints the id. */
export const Default: Story = {
	render: () => {
		const [open, setOpen] = useState(false);
		const [draft, setDraft] = useState<string | null>(null);
		return (
			<div className="wwc:space-y-3 wwc:text-center">
				<Button onClick={() => setOpen(true)}>New link type</Button>
				{draft ? <p className="wwc:text-xs wwc:text-muted-foreground">Draft: {draft}</p> : null}
				<NewLinkTypeDialog
					open={open}
					onOpenChange={setOpen}
					objectTypes={OBJECT_TYPES}
					fkPropertiesFor={(id) => FK_CANDIDATES[id] ?? []}
					targetPrimaryKeyFor={(id) => PRIMARY_KEYS[id] ?? ""}
					onCreate={(d) => setDraft(JSON.stringify(d).slice(0, 120))}
				/>
			</div>
		);
	},
};
