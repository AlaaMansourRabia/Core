import type {Meta, StoryObj} from "storybook/internal/types";

import {Button} from "@wakecap/core-ui/button";
import {NewTypeGroupDialog} from "@wakecap/core-ui/new-type-group-dialog";
import {useState} from "react";

const meta = {
	title: "Widgets/Ontology/New Type Group Dialog",
	component: NewTypeGroupDialog,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"Create a type group: a required name, a description, and an optional members picker. Omitting `objectTypes` removes the Members block **entirely** rather than showing an empty one — which is why the WC3 host, which has no candidates at creation time, simply does not pass it.",
			},
		},
	},
} satisfies Meta<typeof NewTypeGroupDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Assembles a draft and hands it back; the host mints the id. */
export const Default: Story = {
	render: () => {
		const [open, setOpen] = useState(false);
		const [draft, setDraft] = useState<string | null>(null);
		return (
			<div className="wwc:space-y-3 wwc:text-center">
				<Button onClick={() => setOpen(true)}>New type group</Button>
				{draft ? <p className="wwc:text-xs wwc:text-muted-foreground">Draft: {draft}</p> : null}
				<NewTypeGroupDialog
					open={open}
					onOpenChange={setOpen}
					onCreate={(d) => setDraft(JSON.stringify(d).slice(0, 120))}
				/>
			</div>
		);
	},
};
