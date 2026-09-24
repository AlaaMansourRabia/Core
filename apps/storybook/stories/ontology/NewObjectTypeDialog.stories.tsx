import type {Meta, StoryObj} from "storybook/internal/types";

import {Button} from "@corensystem/coren-ui/button";
import {NewObjectTypeDialog} from "@corensystem/coren-ui/new-object-type-dialog";
import {useState} from "react";

const meta = {
	title: "Widgets/Ontology/New Object Type Dialog",
	component: NewObjectTypeDialog,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"Four-step authoring wizard for an ontology object type — metadata, datasources, properties, review. Entirely prop-driven: a host with its own glyph set, datasources and base types reuses it unchanged, and `NewObjectTypeDraft.iconIndex` indexes into the `icons` array the host passed, so the index maps straight back to that host's own icon name. Press **Next →** on the empty first step to see the never-disable rule the whole authoring family shares.",
			},
		},
	},
} satisfies Meta<typeof NewObjectTypeDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Assembles a draft and hands it back; the host mints the id. */
export const Default: Story = {
	render: () => {
		const [open, setOpen] = useState(false);
		const [draft, setDraft] = useState<string | null>(null);
		return (
			<div className="wwc:space-y-3 wwc:text-center">
				<Button onClick={() => setOpen(true)}>New object type</Button>
				{draft ? <p className="wwc:text-xs wwc:text-muted-foreground">Draft: {draft}</p> : null}
				<NewObjectTypeDialog
					open={open}
					onOpenChange={setOpen}
					onCreate={(d) => setDraft(JSON.stringify(d).slice(0, 120))}
				/>
			</div>
		);
	},
};
