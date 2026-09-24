import type {Meta, StoryObj} from "storybook/internal/types";

import {Button} from "@corensystem/coren-ui/button";
import {NewActionTypeDialog} from "@corensystem/coren-ui/new-action-type-dialog";
import {useState} from "react";

const ACTION_OBJECT_TYPES = [
	{id: "ot_permit", label: "Work Permit"},
	{id: "ot_worker", label: "Worker"},
	{id: "ot_site", label: "Site"},
];

const LINK_TYPES = [
	{id: "lt_permit_worker", label: "Permit → Worker"},
	{id: "lt_permit_site", label: "Permit → Site"},
];

const meta = {
	title: "Widgets/Ontology/New Action Type Dialog",
	component: NewActionTypeDialog,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"Four-step authoring wizard for an ontology action type — metadata, parameters, rules, review. It carries the parameter and rule model a fresh copy would have to reinvent: `objectRef` parameters bound to an object type, create/delete rules over objects and links, and a verb-prefix naming check. The API name is camelCased on blur, never while typing.",
			},
		},
	},
} satisfies Meta<typeof NewActionTypeDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Assembles a draft and hands it back; the host mints the id. */
export const Default: Story = {
	render: () => {
		const [open, setOpen] = useState(false);
		const [draft, setDraft] = useState<string | null>(null);
		return (
			<div className="wwc:space-y-3 wwc:text-center">
				<Button onClick={() => setOpen(true)}>New action type</Button>
				{draft ? <p className="wwc:text-xs wwc:text-muted-foreground">Draft: {draft}</p> : null}
				<NewActionTypeDialog
					open={open}
					onOpenChange={setOpen}
					objectTypes={ACTION_OBJECT_TYPES}
					linkTypes={LINK_TYPES}
					onCreate={(d) => setDraft(JSON.stringify(d).slice(0, 120))}
				/>
			</div>
		);
	},
};
